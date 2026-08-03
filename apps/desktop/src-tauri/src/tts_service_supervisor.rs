use std::{
    fs,
    path::{Path, PathBuf},
    process::{Child, ChildStdin, Command, Stdio},
    sync::{
        Arc, Mutex, TryLockError,
        atomic::{AtomicU64, Ordering},
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
    tts_service_fake_child::{
        CRASH_SCENARIO, DESCENDANT_SCENARIO, NORMAL_SCENARIO, PENDING_SCENARIO,
    },
    tts_service_protocol::{
        Frame, FrameKind, TtsNativeFailure, control_kind, decode_control, encode_control,
        read_frame, validate_audio, write_frame,
    },
};

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
const CANDIDATE_LOCK_BYTES: &[u8] = include_bytes!(
    "../../../../services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/uv.lock"
);
const PIPER_LOCK_BYTES: &[u8] =
    include_bytes!("../../../../services/tts/benchmarks/candidates/piper_1_4_2_cpu/uv.lock");
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

static SERVICE_COUNTER: AtomicU64 = AtomicU64::new(1);
static REQUEST_COUNTER: AtomicU64 = AtomicU64::new(1);

#[cfg(windows)]
const SUPERVISED_CHILD_CREATION_FLAGS: u32 = CREATE_NO_WINDOW;

fn configure_supervised_child(command: &mut Command) {
    #[cfg(windows)]
    command.creation_flags(SUPERVISED_CHILD_CREATION_FLAGS);
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

impl ExactRuntime {
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
            .join("services/tts/benchmarks/candidates/piper_1_4_2_cpu/.venv/Scripts/python.exe")
            .canonicalize()
            .map_err(|_| TtsNativeFailure::ChildUnavailable)?;
        let configured_python = absolute_existing_path(python_key, false)?;
        if configured_python != expected_python {
            return Err(TtsNativeFailure::ChildUnavailable);
        }
        let candidate_lock =
            repository_root.join("services/tts/benchmarks/candidates/piper_1_4_2_cpu/uv.lock");
        if fs::read(candidate_lock).map_err(|_| TtsNativeFailure::ChildUnavailable)?
            != PIPER_LOCK_BYTES
        {
            return Err(TtsNativeFailure::ChildUnavailable);
        }
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
            Ok(None) => Self::piper_from_environment(profile_id),
            Err(PackagedCoreError::Invalid | PackagedCoreError::Unavailable) => {
                Err(TtsNativeFailure::ChildUnavailable)
            }
        }
    }

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
            Ok(None) => Self::chatterbox_from_environment(language),
            // Command-line validation and explicitly gated development sessions
            // run before the installed application's Local App Data root exists.
            // End-user discovery still fails closed: the only fallback is the
            // separately gated exact development environment.
            Err(_) => Self::chatterbox_from_environment(language),
        }
    }

    fn for_profile(profile_id: &str, language: Option<&str>) -> Result<Self, TtsNativeFailure> {
        match profile_id {
            QWEN_SERENA_PROFILE_ID if language.is_none_or(|value| value == "es") => {
                Self::qwen_from_environment(profile_id)
            }
            QWEN_AIDEN_PROFILE_ID if language.is_none_or(|value| value == "en") => {
                Self::qwen_from_environment(profile_id)
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
        let service_source = child_process_path(&self.service_source);
        let service_site_packages = child_process_path(&self.service_site_packages);
        let python_path = if service_source == service_site_packages {
            service_source.clone().into_os_string()
        } else {
            std::env::join_paths([&service_source, &service_site_packages])
                .map_err(|_| TtsNativeFailure::ChildUnavailable)?
        };
        let mut command = Command::new(child_process_path(&self.python));
        command
            .arg("-s")
            .arg("-m")
            .arg(self.service_module)
            .current_dir(child_process_path(&self.model_root))
            .env("PYTHONPATH", python_path)
            .env("PYTHONNOUSERSITE", "1")
            .env("PYTHONDONTWRITEBYTECODE", "1")
            .env("PYTHONUTF8", "1")
            .env("HF_HUB_OFFLINE", "1")
            .env("TRANSFORMERS_OFFLINE", "1")
            .env("HF_HUB_DISABLE_TELEMETRY", "1")
            .env_remove("NUMBA_CACHE_DIR")
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
    Exact(ExactRuntime),
    Unavailable,
}

impl ServiceChild {
    fn configured() -> Self {
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
}

struct ChildProcess {
    child: Child,
    #[cfg(windows)]
    job: usize,
}

impl ChildProcess {
    fn spawn(child_configuration: &ServiceChild) -> Result<Self, TtsNativeFailure> {
        let mut command = child_configuration.command()?;
        configure_supervised_child(&mut command);
        let child = command
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|_| TtsNativeFailure::ChildUnavailable)?;
        #[cfg(windows)]
        let job = assign_kill_on_close_job(&child)? as usize;
        Ok(Self {
            child,
            #[cfg(windows)]
            job,
        })
    }

    fn terminate(&mut self) -> Result<(), TtsNativeFailure> {
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
        self.wait_until(TERMINATION_TIMEOUT)
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

struct ServiceSession {
    service_instance_id: String,
    input: Mutex<Option<ChildStdin>>,
    frames: Mutex<Receiver<Result<Frame, TtsNativeFailure>>>,
    process: Mutex<Option<ChildProcess>>,
}

impl ServiceSession {
    fn spawn(
        child_configuration: &ServiceChild,
        service_instance_id: String,
    ) -> Result<Arc<Self>, TtsNativeFailure> {
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
            input: Mutex::new(Some(input)),
            frames: Mutex::new(frames),
            process: Mutex::new(Some(process)),
        }))
    }

    fn write_control(&self, value: &Value) -> Result<(), TtsNativeFailure> {
        let payload = encode_control(value)?;
        let mut input = self
            .input
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?;
        let writer = input.as_mut().ok_or(TtsNativeFailure::ChildUnavailable)?;
        write_frame(writer, FrameKind::Control, &payload)?;
        use std::io::Write;
        writer
            .flush()
            .map_err(|_| TtsNativeFailure::ChildUnavailable)
    }

    fn receive(&self, timeout: Duration) -> Result<Frame, TtsNativeFailure> {
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
        if let Ok(mut input) = self.input.lock() {
            input.take();
        }
        let mut process = self
            .process
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?;
        process.as_mut().map_or(Ok(()), ChildProcess::terminate)?;
        process.take();
        Ok(())
    }

    fn wait_for_exit(&self, timeout: Duration) -> Result<(), TtsNativeFailure> {
        let mut process = self
            .process
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?;
        process
            .as_mut()
            .map_or(Ok(()), |child| child.wait_until(timeout))?;
        process.take();
        Ok(())
    }
}

pub struct TtsServiceSupervisor {
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
    fn new(scenario: &'static str) -> Self {
        Self::with_child(ServiceChild::Fake(scenario))
    }

    fn with_child(child_configuration: ServiceChild) -> Self {
        Self {
            operation: Mutex::new(()),
            lifecycle: Mutex::new(Lifecycle {
                state: "stopped".to_owned(),
                active: None,
            }),
            session: Mutex::new(None),
            child_configuration: Mutex::new(child_configuration),
        }
    }

    pub(crate) fn exact_from_environment() -> Result<Self, TtsNativeFailure> {
        Ok(Self::with_child(ServiceChild::Exact(
            ExactRuntime::from_environment()?,
        )))
    }

    fn exact_demo_available(&self) -> bool {
        ExactRuntime::from_environment().is_ok()
    }

    fn configure_profile(
        &self,
        profile_id: &str,
        language: Option<&str>,
    ) -> Result<(), TtsNativeFailure> {
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
        timeout: Duration,
        expected_kind: &str,
    ) -> Result<Value, TtsNativeFailure> {
        let frame = session.receive(timeout)?;
        if frame.kind != FrameKind::Control {
            return Err(TtsNativeFailure::ProtocolRejected);
        }
        let control = decode_control(&frame.payload)?;
        let actual_kind = control_kind(&control)?;
        if actual_kind != expected_kind {
            return Err(TtsNativeFailure::ProtocolRejected);
        }
        if expected_kind != "protocolRejected"
            && control.get("serviceInstanceId").and_then(Value::as_str)
                != Some(session.service_instance_id.as_str())
        {
            return Err(TtsNativeFailure::ProtocolRejected);
        }
        if expected_kind == "state" {
            let state = control
                .get("state")
                .and_then(Value::as_str)
                .ok_or(TtsNativeFailure::ProtocolRejected)?;
            self.set_state(state)?;
        }
        Ok(control)
    }

    fn fail_session(&self, failure: TtsNativeFailure) -> TtsNativeFailure {
        if let Ok(mut lifecycle) = self.lifecycle.lock() {
            lifecycle.active = None;
            lifecycle.state = "failed".to_owned();
        }
        if let Ok(mut session) = self.session.lock()
            && let Some(active) = session.take()
        {
            let _ = active.terminate();
        }
        failure
    }

    pub fn start(&self) -> Result<Vec<Value>, TtsNativeFailure> {
        let _operation = self.acquire_operation()?;
        if self
            .session
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)?
            .is_some()
        {
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
        let session = ServiceSession::spawn(&child_configuration, service_instance_id.clone())?;
        self.set_state("starting")?;
        *self
            .session
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)? = Some(session.clone());
        let handshake = json!({
            "schemaVersion": 1,
            "protocolVersion": 1,
            "kind": "handshake",
            "serviceInstanceId": service_instance_id,
        });
        if let Err(failure) = session.write_control(&handshake) {
            return Err(self.fail_session(failure));
        }
        let result = (|| {
            let handshaking = self.receive_control(&session, HANDSHAKE_TIMEOUT, "state")?;
            if handshaking.get("state").and_then(Value::as_str) != Some("handshaking") {
                return Err(TtsNativeFailure::ProtocolRejected);
            }
            let accepted =
                self.receive_control(&session, HANDSHAKE_TIMEOUT, "handshakeAccepted")?;
            let unloaded = self.receive_control(&session, HANDSHAKE_TIMEOUT, "state")?;
            if unloaded.get("state").and_then(Value::as_str) != Some("unloaded") {
                return Err(TtsNativeFailure::ProtocolRejected);
            }
            let capabilities = self.receive_control(&session, HANDSHAKE_TIMEOUT, "capabilities")?;
            Ok(vec![handshaking, accepted, unloaded, capabilities])
        })();
        result.map_err(|failure| self.fail_session(failure))
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
            session.write_control(&service_control("load", &session.service_instance_id))?;
            let loading = self.receive_control(&session, LOAD_TIMEOUT, "state")?;
            if loading.get("state").and_then(Value::as_str) != Some("loading") {
                return Err(TtsNativeFailure::ProtocolRejected);
            }
            let warming = self.receive_control(&session, LOAD_TIMEOUT, "state")?;
            if warming.get("state").and_then(Value::as_str) != Some("warming") {
                return Err(TtsNativeFailure::ProtocolRejected);
            }
            let load_elapsed = load_started.elapsed();
            let warm_started = Instant::now();
            session.write_control(&service_control("warm", &session.service_instance_id))?;
            let ready = self.receive_control(&session, WARM_TIMEOUT, "state")?;
            if ready.get("state").and_then(Value::as_str) != Some("ready") {
                return Err(TtsNativeFailure::ProtocolRejected);
            }
            let capabilities = self.receive_control(&session, WARM_TIMEOUT, "capabilities")?;
            Ok(PrepareMeasurement {
                records: vec![loading, warming, ready, capabilities],
                load_elapsed,
                warm_elapsed: warm_started.elapsed(),
            })
        })();
        result.map_err(|failure| self.fail_session(failure))
    }

    pub fn health(&self) -> Result<Vec<Value>, TtsNativeFailure> {
        let _operation = self.acquire_operation()?;
        let session = self.active_session()?;
        let result = (|| {
            session.write_control(&service_control("health", &session.service_instance_id))?;
            let state = self.receive_control(&session, HEALTH_TIMEOUT, "state")?;
            let capabilities = self.receive_control(&session, HEALTH_TIMEOUT, "capabilities")?;
            Ok(vec![state, capabilities])
        })();
        result.map_err(|failure| self.fail_session(failure))
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
        let result = (|| {
            session.write_control(&synthesize)?;
            let generating = self.receive_control(&session, SYNTHESIS_TIMEOUT, "state")?;
            if generating.get("state").and_then(Value::as_str) != Some("generating") {
                return Err(TtsNativeFailure::ProtocolRejected);
            }
            let metadata = self.receive_control(&session, SYNTHESIS_TIMEOUT, "audioMetadata")?;
            if metadata.get("requestId").and_then(Value::as_str)
                != Some(identity.request_id.as_str())
                || !metadata_frame_matches(&metadata, &identity)
            {
                return Err(TtsNativeFailure::ProtocolRejected);
            }
            let command_to_first_transport_frame = command_started.elapsed();
            let audio = session.receive(SYNTHESIS_TIMEOUT)?;
            if audio.kind != FrameKind::Audio {
                return Err(TtsNativeFailure::ProtocolRejected);
            }
            let native_handoff_started = Instant::now();
            validate_audio(&audio.payload, &metadata)?;
            let payload = audio.payload;
            let native_frame_handoff = native_handoff_started.elapsed();
            let completed = self.receive_control(&session, SYNTHESIS_TIMEOUT, "completed")?;
            if !identity.matches_value(completed.get("workIdentity")) {
                return Err(TtsNativeFailure::ProtocolRejected);
            }
            let ready = self.receive_control(&session, SYNTHESIS_TIMEOUT, "state")?;
            if ready.get("state").and_then(Value::as_str) != Some("ready") {
                return Err(TtsNativeFailure::ProtocolRejected);
            }
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
                self.fail_session(failure)
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
        let session = self.active_session()?;
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
        let _ = session.write_control(&cancel);
        session.terminate()?;
        *self
            .session
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)? = None;
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
        let _operation = self.acquire_operation()?;
        let session = self.active_session()?;
        {
            let mut lifecycle = self
                .lifecycle
                .lock()
                .map_err(|_| TtsNativeFailure::InternalFailure)?;
            lifecycle.active = None;
            lifecycle.state = "stopping".to_owned();
        }
        let result = (|| {
            session.write_control(&service_control("shutdown", &session.service_instance_id))?;
            let stopping = self.receive_control(&session, SHUTDOWN_TIMEOUT, "state")?;
            if stopping.get("state").and_then(Value::as_str) != Some("stopping") {
                return Err(TtsNativeFailure::ProtocolRejected);
            }
            let stopped = self.receive_control(&session, SHUTDOWN_TIMEOUT, "state")?;
            if stopped.get("state").and_then(Value::as_str) != Some("stopped") {
                return Err(TtsNativeFailure::ProtocolRejected);
            }
            session.wait_for_exit(SHUTDOWN_TIMEOUT)?;
            Ok(vec![stopping, stopped])
        })();
        *self
            .session
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure)? = None;
        result.map_err(|failure| self.fail_session(failure))
    }

    pub fn force_stop(&self) {
        if let Ok(mut lifecycle) = self.lifecycle.lock() {
            lifecycle.active = None;
            lifecycle.state = "stopped".to_owned();
        }
        if let Ok(mut session) = self.session.lock()
            && let Some(active) = session.take()
        {
            let _ = active.terminate();
        }
    }
}

impl Drop for TtsServiceSupervisor {
    fn drop(&mut self) {
        self.force_stop();
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

#[tauri::command]
pub async fn tts_profile_configuration_available(profile_id: String) -> Result<bool, &'static str> {
    blocking(move || Ok(profile_configuration_available(&profile_id))).await
}

#[tauri::command]
pub async fn start_tts_service(
    supervisor: State<'_, Arc<TtsServiceSupervisor>>,
    profile_id: Option<String>,
    language: Option<String>,
) -> Result<Vec<Value>, &'static str> {
    let supervisor = Arc::clone(supervisor.inner());
    blocking(move || {
        if let Some(profile_id) = profile_id {
            supervisor.configure_profile(&profile_id, language.as_deref())?;
        }
        supervisor.start()
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
) -> Result<Vec<Value>, &'static str> {
    let supervisor = Arc::clone(supervisor.inner());
    blocking(move || supervisor.shutdown()).await
}

pub fn run_host() -> Result<(), &'static str> {
    let segment: Value = serde_json::from_str::<Value>(include_str!(
        "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json"
    ))
    .map_err(|_| TtsNativeFailure::InternalFailure.code())?
    .get("segment")
    .cloned()
    .ok_or(TtsNativeFailure::InternalFailure.code())?;

    let normal = TtsServiceSupervisor::new(NORMAL_SCENARIO);
    normal.start().map_err(TtsNativeFailure::code)?;
    normal.prepare().map_err(TtsNativeFailure::code)?;
    let audio = normal
        .synthesize(segment.clone())
        .map_err(TtsNativeFailure::code)?;
    if audio.len() != 19_200 {
        return Err(TtsNativeFailure::ProtocolRejected.code());
    }
    normal.health().map_err(TtsNativeFailure::code)?;
    normal.shutdown().map_err(TtsNativeFailure::code)?;

    let pending = Arc::new(TtsServiceSupervisor::new(PENDING_SCENARIO));
    pending.start().map_err(TtsNativeFailure::code)?;
    pending.prepare().map_err(TtsNativeFailure::code)?;
    let generation = Arc::clone(&pending);
    let pending_segment = segment.clone();
    let worker = thread::spawn(move || generation.synthesize(pending_segment));
    let deadline = Instant::now() + HANDSHAKE_TIMEOUT;
    loop {
        let active = pending
            .lifecycle
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure.code())?
            .active
            .clone();
        if let Some(identity) = active {
            pending
                .cancel(CancelScope {
                    session_id: identity.session_id,
                    generation_id: identity.generation_id,
                    segment_id: identity.segment_id,
                })
                .map_err(TtsNativeFailure::code)?;
            break;
        }
        if Instant::now() >= deadline {
            return Err(TtsNativeFailure::TimedOut.code());
        }
        thread::sleep(POLL_INTERVAL);
    }
    if worker
        .join()
        .map_err(|_| TtsNativeFailure::InternalFailure.code())?
        != Err(TtsNativeFailure::Cancelled)
    {
        return Err(TtsNativeFailure::ProtocolRejected.code());
    }

    let crash = TtsServiceSupervisor::new(CRASH_SCENARIO);
    crash.start().map_err(TtsNativeFailure::code)?;
    crash.prepare().map_err(TtsNativeFailure::code)?;
    if crash.synthesize(segment.clone()).is_ok() {
        return Err(TtsNativeFailure::ProtocolRejected.code());
    }
    crash.start().map_err(TtsNativeFailure::code)?;
    crash.shutdown().map_err(TtsNativeFailure::code)?;

    #[cfg(windows)]
    {
        let descendant = Arc::new(TtsServiceSupervisor::new(DESCENDANT_SCENARIO));
        descendant.start().map_err(TtsNativeFailure::code)?;
        descendant.prepare().map_err(TtsNativeFailure::code)?;
        let generation = Arc::clone(&descendant);
        let worker = thread::spawn(move || generation.synthesize(segment));
        let deadline = Instant::now() + HANDSHAKE_TIMEOUT;
        loop {
            let active = descendant
                .lifecycle
                .lock()
                .map_err(|_| TtsNativeFailure::InternalFailure.code())?
                .active
                .clone();
            if let Some(identity) = active {
                descendant
                    .cancel(CancelScope {
                        session_id: identity.session_id,
                        generation_id: identity.generation_id,
                        segment_id: identity.segment_id,
                    })
                    .map_err(TtsNativeFailure::code)?;
                break;
            }
            if Instant::now() >= deadline {
                return Err(TtsNativeFailure::TimedOut.code());
            }
            thread::sleep(POLL_INTERVAL);
        }
        let _ = worker.join();
    }
    Ok(())
}

pub fn run_exact_host() -> Result<(), &'static str> {
    let runtime = ExactRuntime::from_environment().map_err(TtsNativeFailure::code)?;
    run_profile_host(runtime, verify_exact_capabilities)
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
mod tests {
    use super::*;

    fn fixture_segment() -> Value {
        serde_json::from_str::<Value>(include_str!(
            "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json"
        ))
        .expect("fixture should parse")["segment"]
            .clone()
    }

    #[test]
    fn validates_segment_and_generates_native_owned_request_identity() {
        let identity = build_work_identity(&fixture_segment()).expect("segment should validate");
        assert!(identity.request_id.starts_with("request:native-"));
        assert_eq!(identity.session_id, "session:synthetic-1");
    }

    #[test]
    fn rejects_text_and_identity_bounds_before_dispatch() {
        let mut segment = fixture_segment();
        segment["text"] = Value::String("a".repeat(MAX_NARRATION_CODE_POINTS + 1));
        assert_eq!(
            build_work_identity(&segment),
            Err(TtsNativeFailure::ResourceLimit)
        );
        segment = fixture_segment();
        segment["sessionId"] = Value::String(String::new());
        assert_eq!(
            build_work_identity(&segment),
            Err(TtsNativeFailure::InvalidInput)
        );
    }

    #[test]
    fn fixed_failure_surface_contains_no_dynamic_input() {
        assert_eq!(
            [
                TtsNativeFailure::Busy,
                TtsNativeFailure::Cancelled,
                TtsNativeFailure::ChildUnavailable,
                TtsNativeFailure::InternalFailure,
                TtsNativeFailure::InvalidInput,
                TtsNativeFailure::InvalidState,
                TtsNativeFailure::ProtocolRejected,
                TtsNativeFailure::ResourceLimit,
                TtsNativeFailure::TimedOut,
            ]
            .map(TtsNativeFailure::code),
            [
                "tts-service-busy",
                "tts-service-cancelled",
                "tts-service-unavailable",
                "tts-service-internal-failure",
                "tts-service-invalid-input",
                "tts-service-invalid-state",
                "tts-service-protocol-rejected",
                "tts-service-resource-limit",
                "tts-service-timeout",
            ]
        );
    }

    #[test]
    fn profile_configuration_rejects_unknown_profile_identity() {
        let supervisor = TtsServiceSupervisor::new(NORMAL_SCENARIO);
        assert_eq!(
            supervisor.configure_profile("unknown-profile", None),
            Err(TtsNativeFailure::InvalidInput)
        );
        assert!(!profile_configuration_available("unknown-profile"));
    }

    #[test]
    fn profile_configuration_rejects_wrong_language_bindings_before_runtime_lookup() {
        for (profile_id, language) in [
            (PIPER_SPANISH_PROFILE_ID, "en"),
            (PIPER_ENGLISH_PROFILE_ID, "es"),
            (QWEN_SERENA_PROFILE_ID, "en"),
            (QWEN_AIDEN_PROFILE_ID, "es"),
        ] {
            assert!(matches!(
                ExactRuntime::for_profile(profile_id, Some(language)),
                Err(TtsNativeFailure::InvalidInput)
            ));
        }
        assert!(matches!(
            ExactRuntime::for_profile(CHATTERBOX_PROFILE_ID, Some("fr")),
            Err(TtsNativeFailure::InvalidInput)
        ));
    }

    #[test]
    fn exact_runtime_never_writes_bytecode_into_verified_packages() {
        let runtime = ExactRuntime {
            python: PathBuf::from("python.exe"),
            model_root: PathBuf::from("model"),
            service_source: PathBuf::from("source"),
            service_site_packages: PathBuf::from("site-packages"),
            service_module: "voxleaf_tts.piper_service",
            runtime_environment: Vec::new(),
            numba_cache_root: None,
        };
        let command = runtime.command().expect("command should be created");
        assert!(command.get_envs().any(|(key, value)| {
            key == "PYTHONDONTWRITEBYTECODE" && value == Some(std::ffi::OsStr::new("1"))
        }));
    }

    #[test]
    fn exact_chatterbox_runtime_redirects_numba_cache_outside_the_verified_package() {
        let cache =
            std::env::temp_dir().join(format!("voxleaf-numba-cache-test-{}", std::process::id()));
        let _ = fs::remove_dir_all(&cache);
        let runtime = ExactRuntime {
            python: PathBuf::from("python.exe"),
            model_root: PathBuf::from("model"),
            service_source: PathBuf::from("source"),
            service_site_packages: PathBuf::from("site-packages"),
            service_module: "voxleaf_tts.chatterbox_service",
            runtime_environment: Vec::new(),
            numba_cache_root: Some(cache.clone()),
        };

        let command = runtime.command().expect("command should be created");

        assert!(cache.is_dir());
        assert!(
            command.get_envs().any(|(key, value)| {
                key == "NUMBA_CACHE_DIR" && value == Some(cache.as_os_str())
            })
        );
        fs::remove_dir_all(cache).expect("test cache should be removed");
    }

    #[cfg(all(windows, feature = "chatterbox-acquisition-validation"))]
    #[test]
    #[ignore = "requires the exact installed Chatterbox package and evaluated GPU"]
    fn installed_chatterbox_supervisor_completes_the_synthetic_lifecycle() {
        let package_root = std::env::var_os("VOXLEAF_CHATTERBOX_VALIDATION_PACKAGE_ROOT")
            .map(PathBuf::from)
            .expect("validation package root should be configured");
        let runtime_root = package_root.join("runtime");
        let site_packages = runtime_root.join("Lib/site-packages");
        let runtime = ExactRuntime {
            python: runtime_root
                .join("python.exe")
                .canonicalize()
                .expect("installed Python should exist"),
            model_root: package_root
                .join("models")
                .canonicalize()
                .expect("installed model root should exist"),
            service_source: site_packages
                .canonicalize()
                .expect("installed service source should exist"),
            service_site_packages: site_packages
                .canonicalize()
                .expect("installed site-packages should exist"),
            service_module: "voxleaf_tts.chatterbox_service",
            runtime_environment: vec![("VOXLEAF_TTS_RUNTIME_CHATTERBOX_LANGUAGE", "es")],
            numba_cache_root: Some(
                package_root
                    .parent()
                    .expect("installed package should have a profile root")
                    .join("cache"),
            ),
        };
        let supervisor = TtsServiceSupervisor::with_child(ServiceChild::Exact(runtime));

        supervisor.start().expect("installed service should start");
        supervisor
            .prepare()
            .expect("installed service should load and warm");
        let audio = supervisor
            .synthesize(fixture_segment())
            .expect("installed service should synthesize the canonical fixture");
        verify_exact_audio(&audio).expect("installed audio should be bounded");
        supervisor
            .shutdown()
            .expect("installed service should shut down");
    }

    #[cfg(windows)]
    #[test]
    fn exact_runtime_removes_verbatim_prefixes_at_the_child_process_boundary() {
        let runtime = ExactRuntime {
            python: PathBuf::from(r"\\?\C:\runtime\python.exe"),
            model_root: PathBuf::from(r"\\?\C:\models"),
            service_source: PathBuf::from(r"\\?\C:\source"),
            service_site_packages: PathBuf::from(r"\\?\C:\site-packages"),
            service_module: "voxleaf_tts.chatterbox_service",
            runtime_environment: Vec::new(),
            numba_cache_root: None,
        };

        let command = runtime.command().expect("command should be created");
        assert_eq!(
            command.get_program(),
            std::ffi::OsStr::new(r"C:\runtime\python.exe")
        );
        assert_eq!(command.get_current_dir(), Some(Path::new(r"C:\models")));
        let python_path = command
            .get_envs()
            .find_map(|(key, value)| (key == "PYTHONPATH").then_some(value).flatten())
            .expect("PYTHONPATH should be configured");
        assert_eq!(
            std::env::split_paths(python_path).collect::<Vec<_>>(),
            [
                PathBuf::from(r"C:\source"),
                PathBuf::from(r"C:\site-packages")
            ]
        );
        assert_eq!(
            child_process_path(Path::new(r"\\?\UNC\server\share\runtime")),
            PathBuf::from(r"\\server\share\runtime")
        );
        assert_eq!(
            child_process_path(Path::new(r"\\?\Volume{authority}\runtime")),
            PathBuf::from(r"\\?\Volume{authority}\runtime")
        );
    }

    #[cfg(windows)]
    #[test]
    fn supervised_children_use_the_windows_no_console_flag() {
        assert_eq!(SUPERVISED_CHILD_CREATION_FLAGS, CREATE_NO_WINDOW);
        assert_eq!(SUPERVISED_CHILD_CREATION_FLAGS, 0x0800_0000);
    }
}
