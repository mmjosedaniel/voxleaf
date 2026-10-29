use std::{
    fs,
    path::{Path, PathBuf},
    process::{Child, ChildStdin, Command, Stdio},
    sync::{
        Arc, Mutex, TryLockError,
        atomic::{AtomicBool, AtomicU64, Ordering},
        mpsc::{self, Receiver, RecvTimeoutError},
    },
    thread,
    time::{Duration, Instant},
};

use serde::Deserialize;
use serde_json::{Value, json};
use tauri::{State, ipc::Response};

#[cfg(windows)]
use std::os::windows::process::CommandExt;
#[cfg(windows)]
use windows_sys::Win32::System::Threading::CREATE_NO_WINDOW;

use crate::{
    tts_optional_chatterbox::discover_installed_chatterbox_runtime,
    tts_protocol_contract::{
        MAX_AUDIO_BYTES, MAX_IDENTIFIER_CODE_POINTS, MAX_IDENTIFIER_UTF8_BYTES,
        MAX_NARRATION_CODE_POINTS, MAX_NARRATION_UTF8_BYTES, valid_identifier,
    },
    tts_release_core::{PackagedCoreError, discover_packaged_piper_runtime},
    tts_service_fake_child::NORMAL_SCENARIO,
    tts_service_protocol::{
        Frame, FrameKind, TtsNativeFailure, control_kind, decode_control, encode_control,
        read_frame, validate_audio, write_frame,
    },
};

mod host_diagnostics;

pub use host_diagnostics::run_host;

pub const HOST_ARGUMENT: &str = "--voxleaf-tts-service-supervisor-host";
pub const EXACT_HOST_ARGUMENT: &str = "--voxleaf-tts-exact-service-host";
pub const PIPER_HOST_ARGUMENT: &str = "--voxleaf-tts-piper-service-host";
pub const BILINGUAL_PROFILE_HOST_ARGUMENT: &str = "--voxleaf-tts-bilingual-profile-service-host";

const QWEN_SERENA_PROFILE_ID: &str = "qwen3-tts-1-7b-customvoice-cuda-bf16-serena-es-v8";
const QWEN_AIDEN_PROFILE_ID: &str = "qwen3-tts-1-7b-customvoice-cuda-bf16-aiden-en-v8";
const PIPER_SPANISH_PROFILE_ID: &str = "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1";
const PIPER_ENGLISH_PROFILE_ID: &str = "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1";
const CHATTERBOX_PROFILE_ID: &str = "chatterbox-multilingual-v3-cuda-bf16-default-v4";
const DEV_ENABLED_KEY: &str = "VOXLEAF_TTS_DEV_ENABLED";
const DEV_PYTHON_KEY: &str = "VOXLEAF_TTS_DEV_PYTHON";
const DEV_MODEL_ROOT_KEY: &str = "VOXLEAF_TTS_DEV_MODEL_ROOT";
const PIPER_ENABLED_KEY: &str = "VOXLEAF_TTS_PIPER_ENABLED";
const PIPER_PYTHON_KEY: &str = "VOXLEAF_TTS_PIPER_PYTHON";
const PIPER_MODEL_ROOT_KEY: &str = "VOXLEAF_TTS_PIPER_MODEL_ROOT";
const PIPER_EN_ENABLED_KEY: &str = "VOXLEAF_TTS_PIPER_EN_ENABLED";
const PIPER_EN_PYTHON_KEY: &str = "VOXLEAF_TTS_PIPER_EN_PYTHON";
const PIPER_EN_MODEL_ROOT_KEY: &str = "VOXLEAF_TTS_PIPER_EN_MODEL_ROOT";
const CHATTERBOX_ENABLED_KEY: &str = "VOXLEAF_TTS_CHATTERBOX_ENABLED";
const CHATTERBOX_PYTHON_KEY: &str = "VOXLEAF_TTS_CHATTERBOX_PYTHON";
const CHATTERBOX_MODEL_ROOT_KEY: &str = "VOXLEAF_TTS_CHATTERBOX_MODEL_ROOT";
#[cfg(not(feature = "release-locked-runtime"))]
const CANDIDATE_LOCK_BYTES: &[u8] = include_bytes!(
    "../../../../services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/uv.lock"
);
#[cfg(not(feature = "release-locked-runtime"))]
const PIPER_LOCK_BYTES: &[u8] = include_bytes!("../../../../services/tts/release/core/uv.lock");
#[cfg(not(feature = "release-locked-runtime"))]
const CHATTERBOX_LOCK_BYTES: &[u8] = include_bytes!(
    "../../../../services/tts/benchmarks/candidates/chatterbox_multilingual_v3_v4/uv.lock"
);

const HANDSHAKE_TIMEOUT: Duration = Duration::from_secs(5);
const LOAD_TIMEOUT: Duration = Duration::from_secs(120);
const WARM_TIMEOUT: Duration = Duration::from_secs(120);
const SYNTHESIS_TIMEOUT: Duration = Duration::from_secs(120);
const HEALTH_TIMEOUT: Duration = Duration::from_secs(2);
const TERMINATION_TIMEOUT: Duration = Duration::from_secs(2);
const SHUTDOWN_TIMEOUT: Duration = Duration::from_secs(5);
const POLL_INTERVAL: Duration = Duration::from_millis(5);
const CHATTERBOX_CHILD_BOOTSTRAP: &str =
    include_str!("tts_service_supervisor/chatterbox_child_bootstrap.py");

fn command_timeout(timeout: Duration) -> Duration {
    #[cfg(test)]
    if let Some(timeout) = tests::command_timeout_override() {
        return timeout;
    }
    timeout
}

fn command_now() -> Instant {
    #[cfg(test)]
    if let Some(now) = tests::command_clock() {
        return now;
    }
    Instant::now()
}

struct CommandDeadline(Instant);

impl CommandDeadline {
    fn new(timeout: Duration) -> Self {
        Self(command_now() + command_timeout(timeout))
    }

    fn remaining(&self) -> Result<Duration, TtsNativeFailure> {
        self.0
            .checked_duration_since(command_now())
            .ok_or(TtsNativeFailure::TimedOut)
    }

    fn check(&self) -> Result<(), TtsNativeFailure> {
        self.remaining().map(|_| ())
    }

    fn write_control(
        &self,
        session: &ServiceSession,
        control: &Value,
    ) -> Result<(), TtsNativeFailure> {
        self.check()?;
        session.write_control(control, self)?;
        self.check()
    }

    fn receive(&self, session: &ServiceSession) -> Result<Frame, TtsNativeFailure> {
        let frame = session.receive(self.remaining()?)?;
        self.check()?;
        Ok(frame)
    }
}

static SERVICE_COUNTER: AtomicU64 = AtomicU64::new(1);
static REQUEST_COUNTER: AtomicU64 = AtomicU64::new(1);

#[cfg(windows)]
const SUPERVISED_CHILD_CREATION_FLAGS: u32 = CREATE_NO_WINDOW;

fn configure_supervised_child(_command: &mut Command) {
    #[cfg(windows)]
    _command.creation_flags(SUPERVISED_CHILD_CREATION_FLAGS);
}

#[cfg(windows)]
// Keep canonical/verbatim paths for native containment checks, but hand
// conventional Windows paths to embedded Python and model libraries. The
// verified Chatterbox runtime rejects otherwise valid `\\?\` child paths.
fn child_process_path(path: &Path) -> PathBuf {
    use std::{
        ffi::OsString,
        os::windows::ffi::{OsStrExt, OsStringExt},
    };

    const VERBATIM_PREFIX: [u16; 4] = [b'\\' as u16, b'\\' as u16, b'?' as u16, b'\\' as u16];
    const VERBATIM_UNC_PREFIX: [u16; 8] = [
        b'\\' as u16,
        b'\\' as u16,
        b'?' as u16,
        b'\\' as u16,
        b'U' as u16,
        b'N' as u16,
        b'C' as u16,
        b'\\' as u16,
    ];

    let encoded = path.as_os_str().encode_wide().collect::<Vec<_>>();
    if encoded.starts_with(&VERBATIM_UNC_PREFIX) {
        let mut normalized = vec![b'\\' as u16, b'\\' as u16];
        normalized.extend_from_slice(&encoded[VERBATIM_UNC_PREFIX.len()..]);
        return PathBuf::from(OsString::from_wide(&normalized));
    }
    if encoded.starts_with(&VERBATIM_PREFIX)
        && encoded.get(VERBATIM_PREFIX.len()).is_some_and(|value| {
            (b'A' as u16..=b'Z' as u16).contains(value)
                || (b'a' as u16..=b'z' as u16).contains(value)
        })
        && encoded.get(VERBATIM_PREFIX.len() + 1) == Some(&(b':' as u16))
        && encoded.get(VERBATIM_PREFIX.len() + 2) == Some(&(b'\\' as u16))
    {
        return PathBuf::from(OsString::from_wide(&encoded[VERBATIM_PREFIX.len()..]));
    }
    path.to_path_buf()
}

#[cfg(not(windows))]
fn child_process_path(path: &Path) -> PathBuf {
    path.to_path_buf()
}

#[derive(Clone)]
struct ExactRuntime {
    python: PathBuf,
    model_root: PathBuf,
    service_source: PathBuf,
    service_site_packages: PathBuf,
    service_module: &'static str,
    runtime_environment: Vec<(&'static str, &'static str)>,
    numba_cache_root: Option<PathBuf>,
}

#[cfg(not(feature = "release-locked-runtime"))]
fn development_service_paths(
    repository_root: &Path,
) -> Result<(PathBuf, PathBuf), TtsNativeFailure> {
    let service_source = repository_root
        .join("services/tts/src")
        .canonicalize()
        .map_err(|_| TtsNativeFailure::ChildUnavailable)?;
    let service_site_packages = repository_root
        .join("services/tts/.venv/Lib/site-packages")
        .canonicalize()
        .map_err(|_| TtsNativeFailure::ChildUnavailable)?;
    for dependency in ["jsonschema", "referencing"] {
        if !service_site_packages.join(dependency).is_dir() {
            return Err(TtsNativeFailure::ChildUnavailable);
        }
    }
    Ok((service_source, service_site_packages))
}

impl ExactRuntime {
    #[cfg(not(feature = "release-locked-runtime"))]
    fn from_environment() -> Result<Self, TtsNativeFailure> {
        if std::env::var_os(DEV_ENABLED_KEY).as_deref() != Some(std::ffi::OsStr::new("1")) {
            return Err(TtsNativeFailure::ChildUnavailable);
        }
        let repository_root = Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../..")
            .canonicalize()
            .map_err(|_| TtsNativeFailure::ChildUnavailable)?;
        let expected_python = repository_root
            .join(
                "services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/.venv/Scripts/python.exe",
            )
            .canonicalize()
            .map_err(|_| TtsNativeFailure::ChildUnavailable)?;
        let configured_python = absolute_existing_path(DEV_PYTHON_KEY, false)?;
        if configured_python != expected_python {
            return Err(TtsNativeFailure::ChildUnavailable);
        }
        let candidate_lock = repository_root
            .join("services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/uv.lock");
        if fs::read(candidate_lock).map_err(|_| TtsNativeFailure::ChildUnavailable)?
            != CANDIDATE_LOCK_BYTES
        {
            return Err(TtsNativeFailure::ChildUnavailable);
        }
        let (service_source, service_site_packages) = development_service_paths(&repository_root)?;
        Ok(Self {
            python: configured_python,
            model_root: absolute_existing_path(DEV_MODEL_ROOT_KEY, true)?,
            service_source,
            service_site_packages,
            service_module: "voxleaf_tts.qwen_service",
            runtime_environment: vec![("VOXLEAF_TTS_RUNTIME_QWEN_VOICE", "serena-es")],
            numba_cache_root: None,
        })
    }

    #[cfg(not(feature = "release-locked-runtime"))]
    fn qwen_from_environment(profile_id: &str) -> Result<Self, TtsNativeFailure> {
        let mut runtime = Self::from_environment()?;
        runtime.runtime_environment = match profile_id {
            QWEN_SERENA_PROFILE_ID => {
                vec![("VOXLEAF_TTS_RUNTIME_QWEN_VOICE", "serena-es")]
            }
            QWEN_AIDEN_PROFILE_ID => vec![("VOXLEAF_TTS_RUNTIME_QWEN_VOICE", "aiden-en")],
            _ => return Err(TtsNativeFailure::InvalidInput),
        };
        Ok(runtime)
    }

    #[cfg(not(feature = "release-locked-runtime"))]
    fn piper_from_environment(profile_id: &str) -> Result<Self, TtsNativeFailure> {
        let (enabled_key, python_key, model_root_key, runtime_voice) = match profile_id {
            PIPER_SPANISH_PROFILE_ID => (
                PIPER_ENABLED_KEY,
                PIPER_PYTHON_KEY,
                PIPER_MODEL_ROOT_KEY,
                "davefx-es",
            ),
            PIPER_ENGLISH_PROFILE_ID => (
                PIPER_EN_ENABLED_KEY,
                PIPER_EN_PYTHON_KEY,
                PIPER_EN_MODEL_ROOT_KEY,
                "joe-en",
            ),
            _ => return Err(TtsNativeFailure::InvalidInput),
        };
        if std::env::var_os(enabled_key).as_deref() != Some(std::ffi::OsStr::new("1")) {
            return Err(TtsNativeFailure::ChildUnavailable);
        }
        let repository_root = Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../..")
            .canonicalize()
            .map_err(|_| TtsNativeFailure::ChildUnavailable)?;
        let expected_python = repository_root
            .join("services/tts/release/core/.venv/Scripts/python.exe")
            .canonicalize()
            .map_err(|_| TtsNativeFailure::ChildUnavailable)?;
        let configured_python = absolute_existing_path(python_key, false)?;
        if configured_python != expected_python {
            return Err(TtsNativeFailure::ChildUnavailable);
        }
        let candidate_lock = repository_root.join("services/tts/release/core/uv.lock");
        if fs::read(candidate_lock).map_err(|_| TtsNativeFailure::ChildUnavailable)?
            != PIPER_LOCK_BYTES
        {
            return Err(TtsNativeFailure::ChildUnavailable);
        }
        let (service_source, service_site_packages) = development_service_paths(&repository_root)?;
        Ok(Self {
            python: configured_python,
            model_root: absolute_existing_path(model_root_key, true)?,
            service_source,
            service_site_packages,
            service_module: "voxleaf_tts.piper_service",
            runtime_environment: vec![("VOXLEAF_TTS_RUNTIME_PIPER_VOICE", runtime_voice)],
            numba_cache_root: None,
        })
    }

    fn piper(profile_id: &str) -> Result<Self, TtsNativeFailure> {
        match discover_packaged_piper_runtime(profile_id) {
            Ok(Some(runtime)) => Ok(Self {
                python: runtime.python,
                model_root: runtime.model_root,
                service_source: runtime.site_packages.clone(),
                service_site_packages: runtime.site_packages,
                service_module: "voxleaf_tts.piper_service",
                runtime_environment: vec![(
                    "VOXLEAF_TTS_RUNTIME_PIPER_VOICE",
                    runtime.runtime_voice,
                )],
                numba_cache_root: None,
            }),
            Ok(None) => {
                #[cfg(feature = "release-locked-runtime")]
                {
                    Err(TtsNativeFailure::ChildUnavailable)
                }
                #[cfg(not(feature = "release-locked-runtime"))]
                {
                    Self::piper_from_environment(profile_id)
                }
            }
            Err(PackagedCoreError::Invalid | PackagedCoreError::Unavailable) => {
                Err(TtsNativeFailure::ChildUnavailable)
            }
        }
    }

    #[cfg(not(feature = "release-locked-runtime"))]
    fn chatterbox_from_environment(language: &str) -> Result<Self, TtsNativeFailure> {
        if !matches!(language, "es" | "en") {
            return Err(TtsNativeFailure::InvalidInput);
        }
        if std::env::var_os(CHATTERBOX_ENABLED_KEY).as_deref() != Some(std::ffi::OsStr::new("1")) {
            return Err(TtsNativeFailure::ChildUnavailable);
        }
        let repository_root = Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../..")
            .canonicalize()
            .map_err(|_| TtsNativeFailure::ChildUnavailable)?;
        let expected_python = repository_root
            .join(
                "services/tts/benchmarks/candidates/chatterbox_multilingual_v3_v4/.venv/Scripts/python.exe",
            )
            .canonicalize()
            .map_err(|_| TtsNativeFailure::ChildUnavailable)?;
        let configured_python = absolute_existing_path(CHATTERBOX_PYTHON_KEY, false)?;
        if configured_python != expected_python {
            return Err(TtsNativeFailure::ChildUnavailable);
        }
        let candidate_lock = repository_root
            .join("services/tts/benchmarks/candidates/chatterbox_multilingual_v3_v4/uv.lock");
        if fs::read(candidate_lock).map_err(|_| TtsNativeFailure::ChildUnavailable)?
            != CHATTERBOX_LOCK_BYTES
        {
            return Err(TtsNativeFailure::ChildUnavailable);
        }
        let (service_source, service_site_packages) = development_service_paths(&repository_root)?;
        Ok(Self {
            python: configured_python,
            model_root: absolute_existing_path(CHATTERBOX_MODEL_ROOT_KEY, true)?,
            service_source,
            service_site_packages,
            service_module: "voxleaf_tts.chatterbox_service",
            runtime_environment: vec![(
                "VOXLEAF_TTS_RUNTIME_CHATTERBOX_LANGUAGE",
                if language == "es" { "es" } else { "en" },
            )],
            numba_cache_root: None,
        })
    }

    fn chatterbox(language: &str) -> Result<Self, TtsNativeFailure> {
        if !matches!(language, "es" | "en") {
            return Err(TtsNativeFailure::InvalidInput);
        }
        match discover_installed_chatterbox_runtime() {
            Ok(Some(runtime)) => Ok(Self {
                python: runtime.python,
                model_root: runtime.model_root,
                service_source: runtime.site_packages.clone(),
                service_site_packages: runtime.site_packages,
                service_module: "voxleaf_tts.chatterbox_service",
                runtime_environment: vec![(
                    "VOXLEAF_TTS_RUNTIME_CHATTERBOX_LANGUAGE",
                    if language == "es" { "es" } else { "en" },
                )],
                numba_cache_root: Some(runtime.numba_cache_root),
            }),
            Ok(None) | Err(_) => {
                #[cfg(feature = "release-locked-runtime")]
                {
                    Err(TtsNativeFailure::ChildUnavailable)
                }
                #[cfg(not(feature = "release-locked-runtime"))]
                {
                    // Explicitly gated development sessions may run before the
                    // installed application's Local App Data root exists.
                    Self::chatterbox_from_environment(language)
                }
            }
        }
    }

    fn for_profile(profile_id: &str, language: Option<&str>) -> Result<Self, TtsNativeFailure> {
        match profile_id {
            QWEN_SERENA_PROFILE_ID if language.is_none_or(|value| value == "es") => {
                #[cfg(feature = "release-locked-runtime")]
                {
                    Err(TtsNativeFailure::ChildUnavailable)
                }
                #[cfg(not(feature = "release-locked-runtime"))]
                {
                    Self::qwen_from_environment(profile_id)
                }
            }
            QWEN_AIDEN_PROFILE_ID if language.is_none_or(|value| value == "en") => {
                #[cfg(feature = "release-locked-runtime")]
                {
                    Err(TtsNativeFailure::ChildUnavailable)
                }
                #[cfg(not(feature = "release-locked-runtime"))]
                {
                    Self::qwen_from_environment(profile_id)
                }
            }
            PIPER_SPANISH_PROFILE_ID if language.is_none_or(|value| value == "es") => {
                Self::piper(profile_id)
            }
            PIPER_ENGLISH_PROFILE_ID if language.is_none_or(|value| value == "en") => {
                Self::piper(profile_id)
            }
            CHATTERBOX_PROFILE_ID => Self::chatterbox(language.unwrap_or("es")),
            _ => Err(TtsNativeFailure::InvalidInput),
        }
    }

    fn command(&self) -> Result<Command, TtsNativeFailure> {
        #[cfg(test)]
        if let Some(command) = tests::maf_exact_command(self) {
            return command;
        }
        let service_source = child_process_path(&self.service_source);
        let service_site_packages = child_process_path(&self.service_site_packages);
        let python_path = if service_source == service_site_packages {
            service_source.clone().into_os_string()
        } else {
            std::env::join_paths([&service_source, &service_site_packages])
                .map_err(|_| TtsNativeFailure::ChildUnavailable)?
        };
        let mut command = Command::new(child_process_path(&self.python));
        command.arg("-s");
        if self.service_module == "voxleaf_tts.chatterbox_service"
            && self.service_source == self.service_site_packages
        {
            command
                .arg("-c")
                .arg(CHATTERBOX_CHILD_BOOTSTRAP)
                .arg(&service_site_packages);
            #[cfg(test)]
            if let Some((observer, receipt)) = tests::chatterbox_observer_arguments(&self.python) {
                command
                    .arg("--diagnostic-observer")
                    .arg(observer)
                    .arg(receipt);
            }
        } else {
            command.arg("-m").arg(self.service_module);
        }
        command
            .current_dir(child_process_path(&self.model_root))
            .env("PYTHONPATH", python_path)
            .env("PYTHONNOUSERSITE", "1")
            .env("PYTHONDONTWRITEBYTECODE", "1")
            .env("PYTHONUTF8", "1")
            .env("HF_HUB_OFFLINE", "1")
            .env("TRANSFORMERS_OFFLINE", "1")
            .env("HF_HUB_DISABLE_TELEMETRY", "1")
            .env_remove("NUMBA_CACHE_DIR")
            .env_remove("PYTHONHOME")
            .env_remove("PYTHONUSERBASE")
            .env_remove("VIRTUAL_ENV")
            .env_remove("CONDA_PREFIX")
            .env_remove("CONDA_DEFAULT_ENV")
            .env_remove("VOXLEAF_CHATTERBOX_VALIDATION_PACKAGE_ROOT")
            .env_remove(DEV_ENABLED_KEY)
            .env_remove(DEV_PYTHON_KEY)
            .env_remove(DEV_MODEL_ROOT_KEY)
            .env_remove(PIPER_ENABLED_KEY)
            .env_remove(PIPER_PYTHON_KEY)
            .env_remove(PIPER_MODEL_ROOT_KEY)
            .env_remove(PIPER_EN_ENABLED_KEY)
            .env_remove(PIPER_EN_PYTHON_KEY)
            .env_remove(PIPER_EN_MODEL_ROOT_KEY)
            .env_remove(CHATTERBOX_ENABLED_KEY)
            .env_remove(CHATTERBOX_PYTHON_KEY)
            .env_remove(CHATTERBOX_MODEL_ROOT_KEY);
        if let Some(cache_root) = &self.numba_cache_root {
            fs::create_dir_all(cache_root).map_err(|_| TtsNativeFailure::ChildUnavailable)?;
            command.env("NUMBA_CACHE_DIR", child_process_path(cache_root));
        }
        for (key, value) in &self.runtime_environment {
            command.env(key, value);
        }
        Ok(command)
    }
}

fn profile_configuration_available(profile_id: &str) -> bool {
    ExactRuntime::for_profile(profile_id, None).is_ok()
}

#[derive(Debug)]
pub(crate) struct PrepareMeasurement {
    pub records: Vec<Value>,
    pub load_elapsed: Duration,
    pub warm_elapsed: Duration,
}

#[derive(Debug)]
pub(crate) struct SynthesisMeasurement {
    pub audio: Vec<u8>,
    pub command_to_first_transport_frame: Duration,
    pub command_to_complete_unit: Duration,
    pub native_frame_handoff: Duration,
}

#[cfg(not(feature = "release-locked-runtime"))]
fn absolute_existing_path(key: &str, directory: bool) -> Result<PathBuf, TtsNativeFailure> {
    let value = std::env::var_os(key).ok_or(TtsNativeFailure::ChildUnavailable)?;
    let configured = PathBuf::from(value);
    if !configured.is_absolute() {
        return Err(TtsNativeFailure::ChildUnavailable);
    }
    let resolved = configured
        .canonicalize()
        .map_err(|_| TtsNativeFailure::ChildUnavailable)?;
    if (directory && !resolved.is_dir()) || (!directory && !resolved.is_file()) {
        return Err(TtsNativeFailure::ChildUnavailable);
    }
    Ok(resolved)
}

#[derive(Clone)]
enum ServiceChild {
    Fake(&'static str),
    #[cfg(all(test, windows))]
    TestCommand(fn() -> Command),
    Exact(ExactRuntime),
    Unavailable,
}

impl ServiceChild {
    fn configured() -> Self {
        #[cfg(feature = "release-locked-runtime")]
        {
            Self::Unavailable
        }
        #[cfg(not(feature = "release-locked-runtime"))]
        {
            if std::env::var_os(DEV_ENABLED_KEY).as_deref() == Some(std::ffi::OsStr::new("1")) {
                return ExactRuntime::from_environment()
                    .map(Self::Exact)
                    .unwrap_or(Self::Unavailable);
            }
            if std::env::var_os(PIPER_ENABLED_KEY).as_deref() == Some(std::ffi::OsStr::new("1")) {
                return ExactRuntime::piper(PIPER_SPANISH_PROFILE_ID)
                    .map(Self::Exact)
                    .unwrap_or(Self::Unavailable);
            }
            Self::Fake(NORMAL_SCENARIO)
        }
    }

    fn command(&self) -> Result<Command, TtsNativeFailure> {
        match self {
            Self::Fake(scenario) => {
                let executable =
                    std::env::current_exe().map_err(|_| TtsNativeFailure::ChildUnavailable)?;
                let mut command = Command::new(executable);
                command
                    .arg(crate::tts_service_fake_child::CHILD_ARGUMENT)
                    .arg(scenario);
                Ok(command)
            }
            Self::Exact(runtime) => runtime.command(),
            #[cfg(all(test, windows))]
            Self::TestCommand(command) => Ok(command()),
            Self::Unavailable => Err(TtsNativeFailure::ChildUnavailable),
        }
    }
}

#[derive(Clone, Debug, Eq, PartialEq)]
struct WorkIdentity {
    request_id: String,
    session_id: String,
    generation_id: String,
    segment_id: String,
}

impl WorkIdentity {
    fn as_value(&self) -> Value {
        json!({
            "requestId": self.request_id,
            "sessionId": self.session_id,
            "generationId": self.generation_id,
            "segmentId": self.segment_id,
        })
    }

    fn matches_value(&self, value: Option<&Value>) -> bool {
        value.is_some_and(|candidate| candidate == &self.as_value())
    }
}

#[derive(Default)]
struct Lifecycle {
    state: String,
    active: Option<WorkIdentity>,
    // One bounded receipt, issued only after verified process termination.
    contained_service_instance_id: Option<String>,
}

struct ChildProcess {
    child: Child,
    #[cfg(windows)]
    job: usize,
}

impl ChildProcess {
    fn spawn(child_configuration: &ServiceChild) -> Result<Self, TtsNativeFailure> {
        #[cfg(windows)]
        return Self::spawn_with_job_assigner(child_configuration, assign_kill_on_close_job);

        #[cfg(not(windows))]
        Self::spawn_without_job(child_configuration)
    }

    #[cfg(windows)]
    fn spawn_with_job_assigner(
        child_configuration: &ServiceChild,
        assign_job: fn(&Child) -> Result<windows_sys::Win32::Foundation::HANDLE, TtsNativeFailure>,
    ) -> Result<Self, TtsNativeFailure> {
        let mut process = Self::spawn_without_job(child_configuration)?;
        match assign_job(&process.child) {
            Ok(job) => {
                process.job = job as usize;
                Ok(process)
            }
            Err(error) => {
                let _ = process.terminate();
                Err(error)
            }
        }
    }

    fn spawn_without_job(child_configuration: &ServiceChild) -> Result<Self, TtsNativeFailure> {
        let mut command = child_configuration.command()?;
        configure_supervised_child(&mut command);
        let child = command
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|_| TtsNativeFailure::ChildUnavailable)?;
        Ok(Self {
            child,
            #[cfg(windows)]
            job: 0,
        })
    }

    fn terminate(&mut self) -> Result<(), TtsNativeFailure> {
        self.terminate_with_timeout(TERMINATION_TIMEOUT)
    }

    fn terminate_with_timeout(&mut self, timeout: Duration) -> Result<(), TtsNativeFailure> {
        #[cfg(windows)]
        {
            if self.job != 0 {
                unsafe {
                    windows_sys::Win32::Foundation::CloseHandle(
                        self.job as windows_sys::Win32::Foundation::HANDLE,
                    );
                }
                self.job = 0;
            } else {
                let _ = self.child.kill();
            }
        }
        #[cfg(not(windows))]
        {
            let _ = self.child.kill();
        }
        self.wait_until(timeout)
    }

    fn wait_until(&mut self, timeout: Duration) -> Result<(), TtsNativeFailure> {
        let started = Instant::now();
        loop {
            match self.child.try_wait() {
                Ok(Some(_)) => return Ok(()),
                Ok(None) if started.elapsed() < timeout => thread::sleep(POLL_INTERVAL),
                Ok(None) => return Err(TtsNativeFailure::TimedOut),
                Err(_) => return Err(TtsNativeFailure::ChildUnavailable),
            }
        }
    }
}

impl Drop for ChildProcess {
    fn drop(&mut self) {
        let _ = self.terminate();
    }
}

#[cfg(windows)]
fn assign_kill_on_close_job(
    child: &Child,
) -> Result<windows_sys::Win32::Foundation::HANDLE, TtsNativeFailure> {
    use std::{mem::size_of, ptr};

    use windows_sys::Win32::{
        Foundation::{CloseHandle, HANDLE},
        System::{
            JobObjects::{
                AssignProcessToJobObject, CreateJobObjectW, JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE,
                JOBOBJECT_EXTENDED_LIMIT_INFORMATION, JobObjectExtendedLimitInformation,
                SetInformationJobObject,
            },
            Threading::{
                OpenProcess, PROCESS_QUERY_LIMITED_INFORMATION, PROCESS_SET_QUOTA,
                PROCESS_TERMINATE,
            },
        },
    };

    unsafe {
        let job = CreateJobObjectW(ptr::null(), ptr::null());
        if job.is_null() {
            return Err(TtsNativeFailure::ChildUnavailable);
        }

        let mut information: JOBOBJECT_EXTENDED_LIMIT_INFORMATION = std::mem::zeroed();
        information.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;
        if SetInformationJobObject(
            job,
            JobObjectExtendedLimitInformation,
            (&raw const information).cast(),
            size_of::<JOBOBJECT_EXTENDED_LIMIT_INFORMATION>() as u32,
        ) == 0
        {
            CloseHandle(job);
            return Err(TtsNativeFailure::ChildUnavailable);
        }

        let process: HANDLE = OpenProcess(
            PROCESS_SET_QUOTA | PROCESS_TERMINATE | PROCESS_QUERY_LIMITED_INFORMATION,
            0,
            child.id(),
        );
        if process.is_null() {
            CloseHandle(job);
            return Err(TtsNativeFailure::ChildUnavailable);
        }
        let assigned = AssignProcessToJobObject(job, process);
        CloseHandle(process);
        if assigned == 0 {
            CloseHandle(job);
            return Err(TtsNativeFailure::ChildUnavailable);
        }
        Ok(job)
    }
}

struct ControlWriteRequest {
    payload: Vec<u8>,
    deadline: Instant,
    completion: mpsc::SyncSender<Result<(), TtsNativeFailure>>,
}

struct ControlWriter {
    requests: Mutex<Option<mpsc::SyncSender<ControlWriteRequest>>>,
    worker: Mutex<Option<thread::JoinHandle<()>>>,
    busy: Arc<AtomicBool>,
    closed: Arc<AtomicBool>,
}

impl ControlWriter {
    fn spawn(mut input: ChildStdin) -> Self {
        let (sender, requests) = mpsc::sync_channel::<ControlWriteRequest>(1);
        let busy = Arc::new(AtomicBool::new(false));
        let closed = Arc::new(AtomicBool::new(false));
        let worker_busy = Arc::clone(&busy);
        let worker_closed = Arc::clone(&closed);
        let worker = thread::spawn(move || {
            use std::io::Write;
            while let Ok(request) = requests.recv() {
                let result = if worker_closed.load(Ordering::Acquire) {
                    Err(TtsNativeFailure::Cancelled)
                } else if Instant::now() > request.deadline {
                    Err(TtsNativeFailure::TimedOut)
                } else {
                    write_frame(&mut input, FrameKind::Control, &request.payload)
                        .and_then(|()| {
                            input
                                .flush()
                                .map_err(|_| TtsNativeFailure::ChildUnavailable)
                        })
                        .and_then(|()| {
                            if worker_closed.load(Ordering::Acquire) {
                                Err(TtsNativeFailure::Cancelled)
                            } else if Instant::now() > request.deadline {
                                Err(TtsNativeFailure::TimedOut)
                            } else {
                                Ok(())
                            }
                        })
                };
                let failed = result.is_err();
                if failed {
                    worker_closed.store(true, Ordering::Release);
                }
                // The write no longer owns work before its acknowledgement permits a successor.
                worker_busy.store(false, Ordering::Release);
                let _ = request.completion.try_send(result);
                if failed {
                    break;
                }
            }
            drop(input);
            worker_closed.store(true, Ordering::Release);
            worker_busy.store(false, Ordering::Release);
        });
        Self {
            requests: Mutex::new(Some(sender)),
            worker: Mutex::new(Some(worker)),
            busy,
            closed,
        }
    }

    #[cfg(test)]
    fn empty() -> Self {
        Self {
            requests: Mutex::new(None),
            worker: Mutex::new(None),
            busy: Arc::new(AtomicBool::new(false)),
            closed: Arc::new(AtomicBool::new(true)),
        }
    }

    fn enqueue(
        &self,
        control: &Value,
        deadline: Instant,
    ) -> Result<Receiver<Result<(), TtsNativeFailure>>, TtsNativeFailure> {
        if self.closed.load(Ordering::Acquire) {
            return Err(TtsNativeFailure::ChildUnavailable);
        }
        // One request includes both queued and in-flight ownership, not one of each.
        self.busy
            .compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire)
            .map_err(|_| TtsNativeFailure::Busy)?;
        let result = (|| {
            let payload = encode_control(control)?;
            let (completion, receiver) = mpsc::sync_channel(1);
            let requests = self
                .requests
                .lock()
                .map_err(|_| TtsNativeFailure::InternalFailure)?;
            if self.closed.load(Ordering::Acquire) {
                return Err(TtsNativeFailure::Cancelled);
            }
            requests
                .as_ref()
                .ok_or(TtsNativeFailure::ChildUnavailable)?
                .try_send(ControlWriteRequest {
                    payload,
                    deadline,
                    completion,
                })
                .map_err(|error| match error {
                    mpsc::TrySendError::Full(_) => TtsNativeFailure::Busy,
                    mpsc::TrySendError::Disconnected(_) => TtsNativeFailure::ChildUnavailable,
                })?;
            Ok(receiver)
        })();
        if result.is_err() {
            self.busy.store(false, Ordering::Release);
        }
        result
    }

    fn close(&self) -> Result<(), TtsNativeFailure> {
        self.closed.store(true, Ordering::Release);
        self.requests
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?
            .take();
        Ok(())
    }

    fn join_until(&self, deadline: Instant) -> Result<(), TtsNativeFailure> {
        let mut worker = self
            .worker
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?;
        if worker.is_none() {
            return Ok(());
        }
        loop {
            let remaining = deadline
                .checked_duration_since(Instant::now())
                .ok_or(TtsNativeFailure::TimedOut)?;
            if worker.as_ref().is_some_and(thread::JoinHandle::is_finished) {
                break;
            }
            thread::sleep(POLL_INTERVAL.min(remaining));
        }
        if let Some(worker) = worker.take() {
            worker
                .join()
                .map_err(|_| TtsNativeFailure::InternalFailure)?;
        }
        Ok(())
    }
}

struct ServiceSession {
    service_instance_id: String,
    start_request_id: Option<String>,
    input: ControlWriter,
    frames: Mutex<Receiver<Result<Frame, TtsNativeFailure>>>,
    process: Mutex<Option<ChildProcess>>,
}

impl ServiceSession {
    fn spawn(
        child_configuration: &ServiceChild,
        service_instance_id: String,
        start_request_id: Option<String>,
    ) -> Result<Arc<Self>, TtsNativeFailure> {
        #[cfg(test)]
        if let Some(session) = tests::spawn_session_hook(&service_instance_id, &start_request_id) {
            return Ok(session);
        }
        let mut process = ChildProcess::spawn(child_configuration)?;
        let input = process
            .child
            .stdin
            .take()
            .ok_or(TtsNativeFailure::ChildUnavailable)?;
        let mut output = process
            .child
            .stdout
            .take()
            .ok_or(TtsNativeFailure::ChildUnavailable)?;
        let (sender, frames) = mpsc::sync_channel(1);
        thread::spawn(move || {
            loop {
                let frame = read_frame(&mut output);
                let failed = frame.is_err();
                if sender.send(frame).is_err() || failed {
                    break;
                }
            }
        });
        Ok(Arc::new(Self {
            service_instance_id,
            start_request_id,
            input: ControlWriter::spawn(input),
            frames: Mutex::new(frames),
            process: Mutex::new(Some(process)),
        }))
    }

    fn write_control(
        &self,
        value: &Value,
        deadline: &CommandDeadline,
    ) -> Result<(), TtsNativeFailure> {
        #[cfg(test)]
        if let Some(result) = tests::write_control_hook(value) {
            return result;
        }
        let completion = self.input.enqueue(value, deadline.0)?;
        let result =
            completion
                .recv_timeout(deadline.remaining()?)
                .map_err(|error| match error {
                    RecvTimeoutError::Timeout => TtsNativeFailure::TimedOut,
                    RecvTimeoutError::Disconnected => TtsNativeFailure::ChildUnavailable,
                })?;
        deadline.check()?;
        result
    }

    fn receive(&self, timeout: Duration) -> Result<Frame, TtsNativeFailure> {
        #[cfg(test)]
        if let Some(result) = tests::receive_hook(timeout) {
            return result;
        }
        let receiver = self
            .frames
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?;
        match receiver.recv_timeout(timeout) {
            Ok(frame) => frame,
            Err(RecvTimeoutError::Timeout) => Err(TtsNativeFailure::TimedOut),
            Err(RecvTimeoutError::Disconnected) => Err(TtsNativeFailure::ChildUnavailable),
        }
    }

    fn terminate(&self) -> Result<(), TtsNativeFailure> {
        let deadline = Instant::now() + TERMINATION_TIMEOUT;
        self.input.close()?;
        let mut process = self
            .process
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?;
        process.as_mut().map_or(Ok(()), |child| {
            child.terminate_with_timeout(deadline.saturating_duration_since(Instant::now()))
        })?;
        self.input.join_until(deadline)?;
        process.take();
        Ok(())
    }

    fn wait_for_exit(&self, timeout: Duration) -> Result<(), TtsNativeFailure> {
        let deadline = Instant::now() + timeout;
        self.input.close()?;
        // Poll without retaining the process lock so force-stop can still interrupt shutdown.
        loop {
            let exited = self
                .process
                .lock()
                .map_err(|_| TtsNativeFailure::InternalFailure)?
                .as_mut()
                .map_or(Ok(true), |process| {
                    process
                        .child
                        .try_wait()
                        .map(|status| status.is_some())
                        .map_err(|_| TtsNativeFailure::ChildUnavailable)
                })?;
            if exited {
                self.input.join_until(deadline)?;
                self.process
                    .lock()
                    .map_err(|_| TtsNativeFailure::InternalFailure)?
                    .take();
                return Ok(());
            }
            let remaining = deadline
                .checked_duration_since(Instant::now())
                .ok_or(TtsNativeFailure::TimedOut)?;
            thread::sleep(POLL_INTERVAL.min(remaining));
        }
    }
}

pub struct TtsServiceSupervisor {
    admission: Mutex<()>,
    operation: Mutex<()>,
    lifecycle: Mutex<Lifecycle>,
    session: Mutex<Option<Arc<ServiceSession>>>,
    child_configuration: Mutex<ServiceChild>,
}

impl Default for TtsServiceSupervisor {
    fn default() -> Self {
        Self::with_child(ServiceChild::configured())
    }
}

impl TtsServiceSupervisor {
    fn lifecycle_observation(&self) -> Result<Value, TtsNativeFailure> {
        let session = self
            .session
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?;
        let lifecycle = self
            .lifecycle
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?;
        Ok(json!({
            "schemaVersion": 1,
            "serviceInstanceId": session.as_ref().map(|session| &session.service_instance_id),
            "state": lifecycle.state,
        }))
    }

    fn new(scenario: &'static str) -> Self {
        Self::with_child(ServiceChild::Fake(scenario))
    }

    fn with_child(child_configuration: ServiceChild) -> Self {
        Self {
            admission: Mutex::new(()),
            operation: Mutex::new(()),
            lifecycle: Mutex::new(Lifecycle {
                state: "stopped".to_owned(),
                active: None,
                contained_service_instance_id: None,
            }),
            session: Mutex::new(None),
            child_configuration: Mutex::new(child_configuration),
        }
    }

    #[cfg(not(feature = "release-locked-runtime"))]
    pub(crate) fn exact_from_environment() -> Result<Self, TtsNativeFailure> {
        Ok(Self::with_child(ServiceChild::Exact(
            ExactRuntime::from_environment()?,
        )))
    }

    #[cfg(feature = "release-locked-runtime")]
    pub(crate) fn exact_from_environment() -> Result<Self, TtsNativeFailure> {
        Err(TtsNativeFailure::ChildUnavailable)
    }

    fn exact_demo_available(&self) -> bool {
        #[cfg(feature = "release-locked-runtime")]
        {
            false
        }
        #[cfg(not(feature = "release-locked-runtime"))]
        {
            ExactRuntime::from_environment().is_ok()
        }
    }

    fn configure_profile(
        &self,
        profile_id: &str,
        language: Option<&str>,
    ) -> Result<(), TtsNativeFailure> {
        let _admission = self.acquire_admission()?;
        let _operation = self.acquire_operation()?;
        if self
            .session
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?
            .is_some()
        {
            return Err(TtsNativeFailure::InvalidState);
        }
        let state = self
            .lifecycle
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?
            .state
            .clone();
        if state != "stopped" && state != "failed" {
            return Err(TtsNativeFailure::InvalidState);
        }
        *self
            .child_configuration
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)? =
            ServiceChild::Exact(ExactRuntime::for_profile(profile_id, language)?);
        Ok(())
    }

    fn acquire_operation(&self) -> Result<std::sync::MutexGuard<'_, ()>, TtsNativeFailure> {
        match self.operation.try_lock() {
            Ok(guard) => Ok(guard),
            Err(TryLockError::WouldBlock) => Err(TtsNativeFailure::Busy),
            Err(TryLockError::Poisoned(_)) => Err(TtsNativeFailure::InternalFailure),
        }
    }

    fn acquire_admission(&self) -> Result<std::sync::MutexGuard<'_, ()>, TtsNativeFailure> {
        match self.admission.try_lock() {
            Ok(guard) => Ok(guard),
            Err(TryLockError::WouldBlock) => Err(TtsNativeFailure::Busy),
            Err(TryLockError::Poisoned(_)) => Err(TtsNativeFailure::InternalFailure),
        }
    }

    pub(crate) fn stop_for_optional_removal(
        &self,
    ) -> Result<std::sync::MutexGuard<'_, ()>, TtsNativeFailure> {
        // Admission precedes operation/session locks. Interruption itself never
        // acquires admission or operation, so a pending handshake stays cancellable.
        let admission = self.acquire_admission()?;
        self.force_stop()?;
        *self
            .child_configuration
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)? = ServiceChild::Unavailable;
        Ok(admission)
    }

    fn active_session(&self) -> Result<Arc<ServiceSession>, TtsNativeFailure> {
        self.session
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?
            .clone()
            .ok_or(TtsNativeFailure::InvalidState)
    }

    fn set_state(&self, state: &str) -> Result<(), TtsNativeFailure> {
        self.lifecycle
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?
            .state = state.to_owned();
        Ok(())
    }

    fn receive_control(
        &self,
        session: &ServiceSession,
        deadline: &CommandDeadline,
        expected_kind: &str,
    ) -> Result<Value, TtsNativeFailure> {
        self.receive_control_with_engine_errors(session, deadline, expected_kind, false)
    }

    fn receive_control_with_engine_errors(
        &self,
        session: &ServiceSession,
        deadline: &CommandDeadline,
        expected_kind: &str,
        allow_engine_error: bool,
    ) -> Result<Value, TtsNativeFailure> {
        let frame = deadline.receive(session)?;
        if frame.kind != FrameKind::Control {
            return Err(TtsNativeFailure::ProtocolRejected);
        }
        let control = decode_control(&frame.payload)?;
        let actual_kind = control_kind(&control)?;
        if actual_kind != "protocolRejected"
            && control.get("serviceInstanceId").and_then(Value::as_str)
                != Some(session.service_instance_id.as_str())
        {
            return Err(TtsNativeFailure::ProtocolRejected);
        }
        let current = self
            .session
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?;
        if current
            .as_ref()
            .is_none_or(|active| active.service_instance_id != session.service_instance_id)
        {
            return Err(TtsNativeFailure::Cancelled);
        }
        if actual_kind == "error" && allow_engine_error {
            let lifecycle = self
                .lifecycle
                .lock()
                .map_err(|_| TtsNativeFailure::InternalFailure)?;
            let valid_context = match lifecycle.active.as_ref() {
                Some(identity) => {
                    let starting = lifecycle.state == "ready" && expected_kind == "state";
                    let generating =
                        lifecycle.state == "generating" && expected_kind == "audioMetadata";
                    (starting || generating)
                        && (identity.matches_value(control.get("workIdentity"))
                            || (starting && control.get("workIdentity").is_none()))
                }
                None => {
                    expected_kind == "state"
                        && matches!(lifecycle.state.as_str(), "unloaded" | "loading" | "warming")
                        && control.get("workIdentity").is_none()
                }
            };
            if !valid_context || control["error"]["code"] != "internal-failure" {
                return Err(TtsNativeFailure::ProtocolRejected);
            }
            return Err(match control.get("reason").and_then(Value::as_str) {
                Some("engine-failure") => TtsNativeFailure::InternalFailure,
                Some("engine-timeout") => TtsNativeFailure::TimedOut,
                _ => TtsNativeFailure::ProtocolRejected,
            });
        }
        if actual_kind != expected_kind {
            return Err(TtsNativeFailure::ProtocolRejected);
        }
        deadline.check()?;
        if expected_kind == "state" {
            let state = control
                .get("state")
                .and_then(Value::as_str)
                .ok_or(TtsNativeFailure::ProtocolRejected)?;
            self.set_state(state)?;
        }
        Ok(control)
    }

    fn receive_expected_state(
        &self,
        session: &ServiceSession,
        deadline: &CommandDeadline,
        expected_state: &str,
    ) -> Result<Value, TtsNativeFailure> {
        let state = self.receive_control(session, deadline, "state")?;
        if state.get("state").and_then(Value::as_str) != Some(expected_state) {
            return Err(TtsNativeFailure::ProtocolRejected);
        }
        Ok(state)
    }

    fn receive_engine_state(
        &self,
        session: &ServiceSession,
        deadline: &CommandDeadline,
        expected_state: &str,
    ) -> Result<Value, TtsNativeFailure> {
        let state = self.receive_control_with_engine_errors(session, deadline, "state", true)?;
        if state.get("state").and_then(Value::as_str) != Some(expected_state) {
            return Err(TtsNativeFailure::ProtocolRejected);
        }
        Ok(state)
    }

    fn fail_session(&self, failed: &ServiceSession, failure: TtsNativeFailure) -> TtsNativeFailure {
        let Ok(mut session) = self.session.lock() else {
            return TtsNativeFailure::InternalFailure;
        };
        if session
            .as_ref()
            .is_none_or(|active| active.service_instance_id != failed.service_instance_id)
        {
            return TtsNativeFailure::Cancelled;
        }
        if let Ok(mut lifecycle) = self.lifecycle.lock() {
            lifecycle.active = None;
            lifecycle.state = "failed".to_owned();
        }
        if let Some(active) = session.as_ref()
            && let Err(error) = active.terminate()
        {
            return error;
        }
        let Ok(mut lifecycle) = self.lifecycle.lock() else {
            return TtsNativeFailure::InternalFailure;
        };
        lifecycle.contained_service_instance_id = Some(failed.service_instance_id.clone());
        session.take();
        failure
    }

    pub fn start(&self) -> Result<Vec<Value>, TtsNativeFailure> {
        self.start_owned(None)
    }

    fn start_owned(
        &self,
        start_request_id: Option<String>,
    ) -> Result<Vec<Value>, TtsNativeFailure> {
        if let Some(request) = &start_request_id {
            validate_start_request_id(request)?;
        }
        let admission = self.acquire_admission()?;
        let _operation = self.acquire_operation()?;
        // Publish the spawned child under the same lock used by interruption.
        let mut slot = self
            .session
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?;
        if slot.is_some() {
            return Err(TtsNativeFailure::InvalidState);
        }
        let service_instance_id = format!(
            "service:native-{}",
            SERVICE_COUNTER.fetch_add(1, Ordering::Relaxed)
        );
        let child_configuration = self
            .child_configuration
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?
            .clone();
        let session = ServiceSession::spawn(
            &child_configuration,
            service_instance_id.clone(),
            start_request_id,
        )?;
        self.set_state("starting")?;
        self.lifecycle
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?
            .contained_service_instance_id = None;
        *slot = Some(session.clone());
        drop(slot);
        drop(admission);
        #[cfg(test)]
        tests::pause_start_after_publish();
        let handshake = json!({
            "schemaVersion": 1,
            "protocolVersion": 1,
            "kind": "handshake",
            "serviceInstanceId": service_instance_id,
        });
        let deadline = CommandDeadline::new(HANDSHAKE_TIMEOUT);
        if let Err(failure) = deadline.write_control(&session, &handshake) {
            return Err(self.fail_session(&session, failure));
        }
        let result = (|| {
            let handshaking = self.receive_expected_state(&session, &deadline, "handshaking")?;
            let accepted = self.receive_control(&session, &deadline, "handshakeAccepted")?;
            let unloaded = self.receive_expected_state(&session, &deadline, "unloaded")?;
            let capabilities = self.receive_control(&session, &deadline, "capabilities")?;
            Ok(vec![handshaking, accepted, unloaded, capabilities])
        })();
        result.map_err(|failure| self.fail_session(&session, failure))
    }

    pub fn prepare(&self) -> Result<Vec<Value>, TtsNativeFailure> {
        self.prepare_measured()
            .map(|measurement| measurement.records)
    }

    pub(crate) fn prepare_measured(&self) -> Result<PrepareMeasurement, TtsNativeFailure> {
        let _operation = self.acquire_operation()?;
        let session = self.active_session()?;
        let result = (|| {
            let load_started = Instant::now();
            let load_deadline = CommandDeadline::new(LOAD_TIMEOUT);
            load_deadline.write_control(
                &session,
                &service_control("load", &session.service_instance_id),
            )?;
            let loading = self.receive_engine_state(&session, &load_deadline, "loading")?;
            let warming = self.receive_engine_state(&session, &load_deadline, "warming")?;
            let load_elapsed = load_started.elapsed();
            let warm_started = Instant::now();
            let warm_deadline = CommandDeadline::new(WARM_TIMEOUT);
            warm_deadline.write_control(
                &session,
                &service_control("warm", &session.service_instance_id),
            )?;
            let ready = self.receive_engine_state(&session, &warm_deadline, "ready")?;
            let capabilities = self.receive_control(&session, &warm_deadline, "capabilities")?;
            Ok(PrepareMeasurement {
                records: vec![loading, warming, ready, capabilities],
                load_elapsed,
                warm_elapsed: warm_started.elapsed(),
            })
        })();
        result.map_err(|failure| self.fail_session(&session, failure))
    }

    pub fn health(&self) -> Result<Vec<Value>, TtsNativeFailure> {
        let _operation = self.acquire_operation()?;
        let session = self.active_session()?;
        let result = (|| {
            let deadline = CommandDeadline::new(HEALTH_TIMEOUT);
            deadline.write_control(
                &session,
                &service_control("health", &session.service_instance_id),
            )?;
            let state = self.receive_control(&session, &deadline, "state")?;
            let capabilities = self.receive_control(&session, &deadline, "capabilities")?;
            Ok(vec![state, capabilities])
        })();
        result.map_err(|failure| self.fail_session(&session, failure))
    }

    pub fn synthesize(&self, segment: Value) -> Result<Vec<u8>, TtsNativeFailure> {
        self.synthesize_measured(segment)
            .map(|measurement| measurement.audio)
    }

    pub(crate) fn synthesize_measured(
        &self,
        segment: Value,
    ) -> Result<SynthesisMeasurement, TtsNativeFailure> {
        let _operation = self.acquire_operation()?;
        let session = self.active_session()?;
        let identity = build_work_identity(&segment)?;
        {
            let mut lifecycle = self
                .lifecycle
                .lock()
                .map_err(|_| TtsNativeFailure::InternalFailure)?;
            if lifecycle.state != "ready" || lifecycle.active.is_some() {
                return Err(TtsNativeFailure::InvalidState);
            }
            lifecycle.active = Some(identity.clone());
        }
        let synthesize = json!({
            "schemaVersion": 1,
            "protocolVersion": 1,
            "kind": "synthesize",
            "serviceInstanceId": session.service_instance_id,
            "requestId": identity.request_id,
            "segment": segment,
        });
        let command_started = Instant::now();
        let deadline = CommandDeadline::new(SYNTHESIS_TIMEOUT);
        let result = (|| {
            deadline.write_control(&session, &synthesize)?;
            self.receive_engine_state(&session, &deadline, "generating")?;
            let metadata = self.receive_control_with_engine_errors(
                &session,
                &deadline,
                "audioMetadata",
                true,
            )?;
            if metadata.get("requestId").and_then(Value::as_str)
                != Some(identity.request_id.as_str())
                || !metadata_frame_matches(&metadata, &identity)
            {
                return Err(TtsNativeFailure::ProtocolRejected);
            }
            let command_to_first_transport_frame = command_started.elapsed();
            let audio = deadline.receive(&session)?;
            if audio.kind != FrameKind::Audio {
                return Err(TtsNativeFailure::ProtocolRejected);
            }
            let native_handoff_started = Instant::now();
            validate_audio(&audio.payload, &metadata)?;
            let payload = audio.payload;
            let native_frame_handoff = native_handoff_started.elapsed();
            let completed = self.receive_control(&session, &deadline, "completed")?;
            if !identity.matches_value(completed.get("workIdentity")) {
                return Err(TtsNativeFailure::ProtocolRejected);
            }
            self.receive_expected_state(&session, &deadline, "ready")?;
            let still_active = self
                .lifecycle
                .lock()
                .map_err(|_| TtsNativeFailure::InternalFailure)?
                .active
                .as_ref()
                == Some(&identity);
            if !still_active {
                return Err(TtsNativeFailure::Cancelled);
            }
            deadline.check()?;
            Ok(SynthesisMeasurement {
                audio: payload,
                command_to_first_transport_frame,
                command_to_complete_unit: command_started.elapsed(),
                native_frame_handoff,
            })
        })();
        let cancelled = self
            .lifecycle
            .lock()
            .map(|mut lifecycle| {
                let cancelled = lifecycle.active.as_ref() != Some(&identity);
                if !cancelled {
                    lifecycle.active = None;
                }
                cancelled
            })
            .unwrap_or(false);
        result.map_err(|failure| {
            if cancelled || failure == TtsNativeFailure::Cancelled {
                TtsNativeFailure::Cancelled
            } else {
                self.fail_session(&session, failure)
            }
        })
    }

    pub(crate) fn active_cancel_scope(&self) -> Result<CancelScope, TtsNativeFailure> {
        let lifecycle = self
            .lifecycle
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?;
        let identity = lifecycle
            .active
            .as_ref()
            .ok_or(TtsNativeFailure::InvalidState)?;
        Ok(CancelScope {
            session_id: identity.session_id.clone(),
            generation_id: identity.generation_id.clone(),
            segment_id: identity.segment_id.clone(),
        })
    }

    pub(crate) fn terminate_child_for_diagnostic(&self) -> Result<(), TtsNativeFailure> {
        self.active_session()?.terminate()
    }

    pub fn cancel(&self, scope: CancelScope) -> Result<Vec<Value>, TtsNativeFailure> {
        validate_scope(&scope)?;
        let mut slot = self
            .session
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?;
        let session = slot.as_ref().ok_or(TtsNativeFailure::InvalidState)?.clone();
        let identity = {
            let mut lifecycle = self
                .lifecycle
                .lock()
                .map_err(|_| TtsNativeFailure::InternalFailure)?;
            let active = lifecycle
                .active
                .as_ref()
                .ok_or(TtsNativeFailure::InvalidState)?;
            if active.session_id != scope.session_id
                || active.generation_id != scope.generation_id
                || active.segment_id != scope.segment_id
            {
                return Err(TtsNativeFailure::InvalidInput);
            }
            let identity = active.clone();
            lifecycle.active = None;
            lifecycle.state = "cancelling".to_owned();
            identity
        };
        let cancel = json!({
            "schemaVersion": 1,
            "protocolVersion": 1,
            "kind": "cancel",
            "serviceInstanceId": session.service_instance_id,
            "workIdentity": identity.as_value(),
        });
        let _ = session
            .input
            .enqueue(&cancel, Instant::now() + TERMINATION_TIMEOUT);
        session.terminate()?;
        slot.take();
        self.set_state("stopped")?;
        Ok(vec![
            state_control(&session.service_instance_id, "cancelling"),
            json!({
                "schemaVersion": 1,
                "protocolVersion": 1,
                "kind": "cancelled",
                "serviceInstanceId": session.service_instance_id,
                "workIdentity": identity.as_value(),
            }),
            state_control(&session.service_instance_id, "stopped"),
        ])
    }

    pub fn shutdown(&self) -> Result<Vec<Value>, TtsNativeFailure> {
        self.shutdown_instance(None)
    }

    fn shutdown_instance(&self, expected: Option<&str>) -> Result<Vec<Value>, TtsNativeFailure> {
        self.shutdown_owned(expected, None)
    }

    fn shutdown_owned(
        &self,
        expected: Option<&str>,
        start_request_id: Option<&str>,
    ) -> Result<Vec<Value>, TtsNativeFailure> {
        if let Some(request) = start_request_id {
            validate_start_request_id(request)?;
        }
        let operation = match self.acquire_operation() {
            Ok(guard) => Some(guard),
            Err(TtsNativeFailure::Busy) => None,
            Err(error) => return Err(error),
        };
        #[cfg(test)]
        if operation.is_none() {
            tests::pause_shutdown_after_busy();
        }
        let mut slot = self
            .session
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?;
        if slot.is_none() {
            let mut lifecycle = self
                .lifecycle
                .lock()
                .map_err(|_| TtsNativeFailure::InternalFailure)?;
            let id = expected.ok_or(TtsNativeFailure::InvalidState)?;
            match lifecycle.contained_service_instance_id.as_deref() {
                Some(contained) if contained == id => {}
                Some(_) => return Err(TtsNativeFailure::Cancelled),
                None => return Err(TtsNativeFailure::InvalidState),
            }
            lifecycle.state = "stopped".to_owned();
            return Ok(vec![
                state_control(id, "stopping"),
                state_control(id, "stopped"),
            ]);
        }
        if operation.is_none() {
            let session = slot.as_ref().ok_or(TtsNativeFailure::InvalidState)?;
            if expected.is_some_and(|id| id != session.service_instance_id)
                || start_request_id
                    .is_some_and(|id| session.start_request_id.as_deref() != Some(id))
            {
                return Err(TtsNativeFailure::Cancelled);
            }
            let id = session.service_instance_id.clone();
            {
                let mut lifecycle = self
                    .lifecycle
                    .lock()
                    .map_err(|_| TtsNativeFailure::InternalFailure)?;
                lifecycle.active = None;
                lifecycle.state = "stopping".to_owned();
            }
            session.terminate()?;
            slot.take();
            self.set_state("stopped")?;
            return Ok(vec![
                state_control(&id, "stopping"),
                state_control(&id, "stopped"),
            ]);
        }
        drop(slot);
        let session = self.active_session()?;
        if expected.is_some_and(|id| id != session.service_instance_id)
            || start_request_id.is_some_and(|id| session.start_request_id.as_deref() != Some(id))
        {
            return Err(TtsNativeFailure::Cancelled);
        }
        {
            let mut lifecycle = self
                .lifecycle
                .lock()
                .map_err(|_| TtsNativeFailure::InternalFailure)?;
            lifecycle.active = None;
            lifecycle.state = "stopping".to_owned();
        }
        let result = (|| {
            let deadline = CommandDeadline::new(SHUTDOWN_TIMEOUT);
            deadline.write_control(
                &session,
                &service_control("shutdown", &session.service_instance_id),
            )?;
            let stopping = self.receive_expected_state(&session, &deadline, "stopping")?;
            let stopped = self.receive_expected_state(&session, &deadline, "stopped")?;
            session.wait_for_exit(deadline.remaining()?)?;
            deadline.check()?;
            Ok(vec![stopping, stopped])
        })();
        let records = result.map_err(|failure| self.fail_session(&session, failure))?;
        let mut slot = self
            .session
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?;
        if slot
            .as_ref()
            .is_some_and(|active| Arc::ptr_eq(active, &session))
        {
            slot.take();
        }
        Ok(records)
    }

    pub fn force_stop(&self) -> Result<(), TtsNativeFailure> {
        let mut session = self
            .session
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?;
        let mut lifecycle = self
            .lifecycle
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?;
        // Keep ownership and the last truthful state until termination is verified.
        if let Some(active) = session.as_ref() {
            active.terminate()?;
        }
        session.take();
        lifecycle.active = None;
        lifecycle.state = "stopped".to_owned();
        lifecycle.contained_service_instance_id = None;
        Ok(())
    }
}

impl Drop for TtsServiceSupervisor {
    fn drop(&mut self) {
        let _ = self.force_stop();
    }
}

fn service_control(kind: &str, service_instance_id: &str) -> Value {
    json!({
        "schemaVersion": 1,
        "protocolVersion": 1,
        "kind": kind,
        "serviceInstanceId": service_instance_id,
    })
}

fn state_control(service_instance_id: &str, state: &str) -> Value {
    json!({
        "schemaVersion": 1,
        "protocolVersion": 1,
        "kind": "state",
        "serviceInstanceId": service_instance_id,
        "state": state,
    })
}

fn build_work_identity(segment: &Value) -> Result<WorkIdentity, TtsNativeFailure> {
    let object = segment.as_object().ok_or(TtsNativeFailure::InvalidInput)?;
    let text = object
        .get("text")
        .and_then(Value::as_str)
        .ok_or(TtsNativeFailure::InvalidInput)?;
    if text.is_empty()
        || text.chars().count() > MAX_NARRATION_CODE_POINTS
        || text.len() > MAX_NARRATION_UTF8_BYTES
    {
        return Err(TtsNativeFailure::ResourceLimit);
    }
    for name in ["sessionId", "generationId", "segmentId"] {
        if !valid_identifier(object.get(name)) {
            return Err(TtsNativeFailure::InvalidInput);
        }
    }
    let request_id = format!(
        "request:native-{}",
        REQUEST_COUNTER.fetch_add(1, Ordering::Relaxed)
    );
    if request_id.chars().count() > MAX_IDENTIFIER_CODE_POINTS
        || request_id.len() > MAX_IDENTIFIER_UTF8_BYTES
    {
        return Err(TtsNativeFailure::InternalFailure);
    }
    Ok(WorkIdentity {
        request_id,
        session_id: object["sessionId"]
            .as_str()
            .ok_or(TtsNativeFailure::InvalidInput)?
            .to_owned(),
        generation_id: object["generationId"]
            .as_str()
            .ok_or(TtsNativeFailure::InvalidInput)?
            .to_owned(),
        segment_id: object["segmentId"]
            .as_str()
            .ok_or(TtsNativeFailure::InvalidInput)?
            .to_owned(),
    })
}

fn metadata_frame_matches(metadata: &Value, identity: &WorkIdentity) -> bool {
    let Some(frame) = metadata.get("frame").and_then(Value::as_object) else {
        return false;
    };
    frame.get("frameId").and_then(Value::as_str) == Some(identity.request_id.as_str())
        && frame.get("sessionId").and_then(Value::as_str) == Some(identity.session_id.as_str())
        && frame.get("generationId").and_then(Value::as_str)
            == Some(identity.generation_id.as_str())
        && frame.get("segmentId").and_then(Value::as_str) == Some(identity.segment_id.as_str())
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CancelScope {
    session_id: String,
    generation_id: String,
    segment_id: String,
}

fn validate_scope(scope: &CancelScope) -> Result<(), TtsNativeFailure> {
    for identifier in [&scope.session_id, &scope.generation_id, &scope.segment_id] {
        if !valid_identifier(Some(&Value::String(identifier.clone()))) {
            return Err(TtsNativeFailure::InvalidInput);
        }
    }
    Ok(())
}

async fn blocking<T: Send + 'static>(
    operation: impl FnOnce() -> Result<T, TtsNativeFailure> + Send + 'static,
) -> Result<T, &'static str> {
    tauri::async_runtime::spawn_blocking(operation)
        .await
        .map_err(|_| TtsNativeFailure::InternalFailure.code())?
        .map_err(TtsNativeFailure::code)
}

#[tauri::command]
pub async fn exact_tts_demo_available(
    supervisor: State<'_, Arc<TtsServiceSupervisor>>,
) -> Result<bool, &'static str> {
    Ok(supervisor.exact_demo_available())
}

/// Content-free artifact identity used by the ordinary-package isolation
/// harness. This reports the compile-time boundary of the running binary; it
/// does not inspect the host or expose paths.
#[tauri::command]
pub fn release_locked_runtime_enabled() -> bool {
    cfg!(feature = "release-locked-runtime")
}

#[tauri::command]
pub async fn tts_profile_configuration_available(profile_id: String) -> Result<bool, &'static str> {
    blocking(move || Ok(profile_configuration_available(&profile_id))).await
}

#[tauri::command]
pub async fn tts_service_lifecycle_observation(
    supervisor: State<'_, Arc<TtsServiceSupervisor>>,
) -> Result<Value, &'static str> {
    let supervisor = Arc::clone(supervisor.inner());
    blocking(move || supervisor.lifecycle_observation()).await
}

#[tauri::command]
pub async fn start_tts_service(
    supervisor: State<'_, Arc<TtsServiceSupervisor>>,
    profile_id: Option<String>,
    language: Option<String>,
    start_request_id: Option<String>,
) -> Result<Vec<Value>, &'static str> {
    let supervisor = Arc::clone(supervisor.inner());
    blocking(move || {
        if let Some(request) = &start_request_id {
            validate_start_request_id(request)?;
        }
        if let Some(profile_id) = profile_id {
            supervisor.configure_profile(&profile_id, language.as_deref())?;
        }
        supervisor.start_owned(start_request_id)
    })
    .await
}

#[tauri::command]
pub async fn prepare_tts_service(
    supervisor: State<'_, Arc<TtsServiceSupervisor>>,
) -> Result<Vec<Value>, &'static str> {
    let supervisor = Arc::clone(supervisor.inner());
    blocking(move || supervisor.prepare()).await
}

#[tauri::command]
pub async fn health_tts_service(
    supervisor: State<'_, Arc<TtsServiceSupervisor>>,
) -> Result<Vec<Value>, &'static str> {
    let supervisor = Arc::clone(supervisor.inner());
    blocking(move || supervisor.health()).await
}

#[tauri::command]
pub async fn synthesize_tts_segment(
    supervisor: State<'_, Arc<TtsServiceSupervisor>>,
    segment: Value,
) -> Result<Response, &'static str> {
    let supervisor = Arc::clone(supervisor.inner());
    blocking(move || supervisor.synthesize(segment))
        .await
        .map(Response::new)
}

#[tauri::command]
pub async fn cancel_tts_generation(
    supervisor: State<'_, Arc<TtsServiceSupervisor>>,
    scope: CancelScope,
) -> Result<Vec<Value>, &'static str> {
    let supervisor = Arc::clone(supervisor.inner());
    blocking(move || supervisor.cancel(scope)).await
}

#[tauri::command]
pub async fn shutdown_tts_service(
    supervisor: State<'_, Arc<TtsServiceSupervisor>>,
    service_instance_id: Option<String>,
    start_request_id: Option<String>,
) -> Result<Vec<Value>, &'static str> {
    let supervisor = Arc::clone(supervisor.inner());
    blocking(move || {
        supervisor.shutdown_owned(service_instance_id.as_deref(), start_request_id.as_deref())
    })
    .await
}

fn validate_start_request_id(value: &str) -> Result<(), TtsNativeFailure> {
    if value.starts_with("start:")
        && (7..=96).contains(&value.len())
        && value
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || matches!(byte, b':' | b'-'))
    {
        Ok(())
    } else {
        Err(TtsNativeFailure::InvalidInput)
    }
}

pub fn run_exact_host() -> Result<(), &'static str> {
    #[cfg(feature = "release-locked-runtime")]
    {
        Err(TtsNativeFailure::ChildUnavailable.code())
    }
    #[cfg(not(feature = "release-locked-runtime"))]
    {
        let runtime = ExactRuntime::from_environment().map_err(TtsNativeFailure::code)?;
        run_profile_host(runtime, verify_exact_capabilities)
    }
}

pub fn run_piper_host() -> Result<(), &'static str> {
    let runtime = ExactRuntime::piper(PIPER_SPANISH_PROFILE_ID).map_err(TtsNativeFailure::code)?;
    run_profile_host(runtime, verify_piper_capabilities)
}

pub fn run_bilingual_profile_host(profile_id: &str, language: &str) -> Result<(), &'static str> {
    let runtime =
        ExactRuntime::for_profile(profile_id, Some(language)).map_err(TtsNativeFailure::code)?;
    let verify = match profile_id {
        PIPER_SPANISH_PROFILE_ID | PIPER_ENGLISH_PROFILE_ID => verify_piper_capabilities,
        QWEN_SERENA_PROFILE_ID | QWEN_AIDEN_PROFILE_ID | CHATTERBOX_PROFILE_ID => {
            verify_exact_capabilities
        }
        _ => return Err(TtsNativeFailure::InvalidInput.code()),
    };
    run_profile_host(runtime, verify)
}

fn run_profile_host(
    runtime: ExactRuntime,
    verify_capabilities: fn(&[Value]) -> Result<(), &'static str>,
) -> Result<(), &'static str> {
    let segment: Value = serde_json::from_str::<Value>(include_str!(
        "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json"
    ))
    .map_err(|_| TtsNativeFailure::InternalFailure.code())?
    .get("segment")
    .cloned()
    .ok_or(TtsNativeFailure::InternalFailure.code())?;
    let supervisor = Arc::new(TtsServiceSupervisor::with_child(ServiceChild::Exact(
        runtime,
    )));

    supervisor.start().map_err(TtsNativeFailure::code)?;
    let prepared = supervisor.prepare().map_err(TtsNativeFailure::code)?;
    verify_capabilities(&prepared)?;
    let first = supervisor
        .synthesize(segment.clone())
        .map_err(TtsNativeFailure::code)?;
    verify_exact_audio(&first)?;
    drop(first);
    supervisor.health().map_err(TtsNativeFailure::code)?;

    let generation = Arc::clone(&supervisor);
    let pending_segment = segment.clone();
    let worker = thread::spawn(move || generation.synthesize(pending_segment));
    let deadline = Instant::now() + HANDSHAKE_TIMEOUT;
    let active = loop {
        if let Some(identity) = supervisor
            .lifecycle
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure.code())?
            .active
            .clone()
        {
            break identity;
        }
        if Instant::now() >= deadline {
            return Err(TtsNativeFailure::TimedOut.code());
        }
        thread::sleep(POLL_INTERVAL);
    };
    if supervisor.synthesize(segment.clone()) != Err(TtsNativeFailure::Busy) {
        return Err(TtsNativeFailure::ProtocolRejected.code());
    }
    supervisor
        .cancel(CancelScope {
            session_id: active.session_id,
            generation_id: active.generation_id,
            segment_id: active.segment_id,
        })
        .map_err(TtsNativeFailure::code)?;
    if worker
        .join()
        .map_err(|_| TtsNativeFailure::InternalFailure.code())?
        != Err(TtsNativeFailure::Cancelled)
    {
        return Err(TtsNativeFailure::ProtocolRejected.code());
    }

    supervisor.start().map_err(TtsNativeFailure::code)?;
    let reloaded = supervisor.prepare().map_err(TtsNativeFailure::code)?;
    verify_capabilities(&reloaded)?;
    let after_reload = supervisor
        .synthesize(segment)
        .map_err(TtsNativeFailure::code)?;
    verify_exact_audio(&after_reload)?;
    drop(after_reload);
    supervisor.shutdown().map_err(TtsNativeFailure::code)?;
    Ok(())
}

fn verify_piper_capabilities(records: &[Value]) -> Result<(), &'static str> {
    let supported = records.iter().any(|record| {
        record.get("kind").and_then(Value::as_str) == Some("capabilities")
            && record
                .pointer("/report/capabilities/localSpeechGeneration")
                .and_then(Value::as_str)
                == Some("supported")
            && record
                .pointer("/report/capabilities/hardwareAcceleration")
                .and_then(Value::as_str)
                == Some("unsupported")
            && record
                .pointer("/report/capabilities/streamingGeneration")
                .and_then(Value::as_str)
                == Some("unsupported")
            && record
                .pointer("/report/capabilities/generationCancellation")
                .and_then(Value::as_str)
                == Some("unsupported")
            && record
                .pointer("/report/capabilities/cpuFallback")
                .and_then(Value::as_str)
                == Some("supported")
    });
    if supported {
        Ok(())
    } else {
        Err(TtsNativeFailure::ProtocolRejected.code())
    }
}

pub(crate) fn verify_exact_capabilities(records: &[Value]) -> Result<(), &'static str> {
    let supported = records.iter().any(|record| {
        record.get("kind").and_then(Value::as_str) == Some("capabilities")
            && record
                .pointer("/report/capabilities/localSpeechGeneration")
                .and_then(Value::as_str)
                == Some("supported")
            && record
                .pointer("/report/capabilities/hardwareAcceleration")
                .and_then(Value::as_str)
                == Some("supported")
            && record
                .pointer("/report/capabilities/streamingGeneration")
                .and_then(Value::as_str)
                == Some("unsupported")
            && record
                .pointer("/report/capabilities/generationCancellation")
                .and_then(Value::as_str)
                == Some("unsupported")
            && record
                .pointer("/report/capabilities/cpuFallback")
                .and_then(Value::as_str)
                == Some("unsupported")
    });
    if supported {
        Ok(())
    } else {
        Err(TtsNativeFailure::ProtocolRejected.code())
    }
}

fn verify_exact_audio(audio: &[u8]) -> Result<(), &'static str> {
    if audio.is_empty() || !audio.len().is_multiple_of(4) || audio.len() as u64 > MAX_AUDIO_BYTES {
        return Err(TtsNativeFailure::ProtocolRejected.code());
    }
    Ok(())
}

#[cfg(test)]
mod tests;
