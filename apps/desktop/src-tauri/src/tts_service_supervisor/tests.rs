use super::*;

#[cfg(windows)]
use std::sync::atomic::{AtomicU32, Ordering};

#[cfg(windows)]
static ASSIGNMENT_FAILURE_CHILD_ID: AtomicU32 = AtomicU32::new(0);

#[cfg(windows)]
fn fail_job_assignment(
    child: &Child,
) -> Result<windows_sys::Win32::Foundation::HANDLE, TtsNativeFailure> {
    ASSIGNMENT_FAILURE_CHILD_ID.store(child.id(), Ordering::SeqCst);
    Err(TtsNativeFailure::ChildUnavailable)
}

fn fixture_segment() -> Value {
    serde_json::from_str::<Value>(include_str!(
        "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json"
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
fn exact_runtime_uses_an_absolute_private_interpreter_and_scrubs_host_python_state() {
    let private_root = std::env::temp_dir().join("voxleaf-private-runtime-command-test");
    let runtime = ExactRuntime {
        python: private_root.join("runtime/python.exe"),
        model_root: private_root.join("models"),
        service_source: private_root.join("runtime/Lib/site-packages"),
        service_site_packages: private_root.join("runtime/Lib/site-packages"),
        service_module: "voxleaf_tts.chatterbox_service",
        runtime_environment: Vec::new(),
        numba_cache_root: None,
    };

    let command = runtime.command().expect("command should be created");
    assert!(Path::new(command.get_program()).is_absolute());
    assert_eq!(command.get_program(), runtime.python.as_os_str());
    assert_eq!(
        command.get_args().collect::<Vec<_>>(),
        [
            std::ffi::OsStr::new("-s"),
            std::ffi::OsStr::new("-m"),
            std::ffi::OsStr::new("voxleaf_tts.chatterbox_service"),
        ]
    );
    for removed in [
        "PYTHONHOME",
        "PYTHONUSERBASE",
        "VIRTUAL_ENV",
        "CONDA_PREFIX",
        "CONDA_DEFAULT_ENV",
        "VOXLEAF_TTS_DEV_ENABLED",
        "VOXLEAF_TTS_DEV_PYTHON",
        "VOXLEAF_TTS_DEV_MODEL_ROOT",
        "VOXLEAF_TTS_PIPER_ENABLED",
        "VOXLEAF_TTS_PIPER_PYTHON",
        "VOXLEAF_TTS_PIPER_MODEL_ROOT",
        "VOXLEAF_TTS_PIPER_EN_ENABLED",
        "VOXLEAF_TTS_PIPER_EN_PYTHON",
        "VOXLEAF_TTS_PIPER_EN_MODEL_ROOT",
        "VOXLEAF_TTS_CHATTERBOX_ENABLED",
        "VOXLEAF_TTS_CHATTERBOX_PYTHON",
        "VOXLEAF_TTS_CHATTERBOX_MODEL_ROOT",
        "VOXLEAF_CHATTERBOX_VALIDATION_PACKAGE_ROOT",
    ] {
        assert!(
            command
                .get_envs()
                .any(|(key, value)| { key == std::ffi::OsStr::new(removed) && value.is_none() })
        );
    }
    assert!(!command.get_envs().any(|(key, _)| key == "PATH"));
}

#[cfg(feature = "release-locked-runtime")]
#[test]
fn release_locked_runtime_rejects_development_only_profiles_and_defaults() {
    assert!(release_locked_runtime_enabled());
    assert!(matches!(
        ExactRuntime::for_profile(QWEN_SERENA_PROFILE_ID, Some("es")),
        Err(TtsNativeFailure::ChildUnavailable)
    ));
    assert!(matches!(
        ExactRuntime::for_profile(QWEN_AIDEN_PROFILE_ID, Some("en")),
        Err(TtsNativeFailure::ChildUnavailable)
    ));
    assert!(matches!(
        ServiceChild::configured(),
        ServiceChild::Unavailable
    ));
    assert!(!TtsServiceSupervisor::default().exact_demo_available());
    assert!(matches!(
        TtsServiceSupervisor::exact_from_environment(),
        Err(TtsNativeFailure::ChildUnavailable)
    ));
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
        command
            .get_envs()
            .any(|(key, value)| { key == "NUMBA_CACHE_DIR" && value == Some(cache.as_os_str()) })
    );
    fs::remove_dir_all(cache).expect("test cache should be removed");
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

#[cfg(windows)]
#[test]
fn failed_job_assignment_kills_and_reaps_the_spawned_child() {
    use windows_sys::Win32::{
        Foundation::CloseHandle,
        System::Threading::{OpenProcess, PROCESS_QUERY_LIMITED_INFORMATION},
    };

    ASSIGNMENT_FAILURE_CHILD_ID.store(0, Ordering::SeqCst);
    assert!(matches!(
        ChildProcess::spawn_with_job_assigner(
            &ServiceChild::Fake(NORMAL_SCENARIO),
            fail_job_assignment,
        ),
        Err(TtsNativeFailure::ChildUnavailable)
    ));

    let child_id = ASSIGNMENT_FAILURE_CHILD_ID.load(Ordering::SeqCst);
    assert_ne!(child_id, 0, "the assigner should observe the spawned child");
    let process = unsafe { OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, 0, child_id) };
    assert!(
        process.is_null(),
        "the failed assignment path must wait until the child process is reaped"
    );
    if !process.is_null() {
        unsafe { CloseHandle(process) };
    }
}
