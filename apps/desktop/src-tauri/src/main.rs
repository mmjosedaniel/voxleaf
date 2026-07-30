#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Arc;

use tauri::Manager;

#[cfg(test)]
mod hardware_profile_authority;
mod host_profile_detection;
mod tts_protocol_contract;
mod tts_protocol_probe;
mod tts_service_fake_child;
mod tts_service_handoff;
mod tts_service_protocol;
mod tts_service_supervisor;

fn main() {
    let mut arguments = std::env::args_os();
    let _executable = arguments.next();
    match arguments.next().as_deref() {
        Some(argument) if argument == std::ffi::OsStr::new(tts_protocol_probe::CHILD_ARGUMENT) => {
            std::process::exit(if tts_protocol_probe::run_child().is_ok() {
                0
            } else {
                1
            });
        }
        Some(argument) if argument == std::ffi::OsStr::new(tts_protocol_probe::HOST_ARGUMENT) => {
            std::process::exit(if tts_protocol_probe::run_host().is_ok() {
                0
            } else {
                1
            });
        }
        Some(argument)
            if argument == std::ffi::OsStr::new(tts_service_fake_child::CHILD_ARGUMENT) =>
        {
            let scenario = arguments.next();
            std::process::exit(
                if tts_service_fake_child::run_child(
                    scenario.as_deref().and_then(std::ffi::OsStr::to_str),
                )
                .is_ok()
                {
                    0
                } else {
                    1
                },
            );
        }
        Some(argument)
            if argument == std::ffi::OsStr::new(tts_service_fake_child::DESCENDANT_ARGUMENT) =>
        {
            std::process::exit(if tts_service_fake_child::run_descendant().is_ok() {
                0
            } else {
                1
            });
        }
        Some(argument)
            if argument == std::ffi::OsStr::new(tts_service_supervisor::HOST_ARGUMENT) =>
        {
            std::process::exit(if tts_service_supervisor::run_host().is_ok() {
                0
            } else {
                1
            });
        }
        Some(argument)
            if argument == std::ffi::OsStr::new(tts_service_supervisor::EXACT_HOST_ARGUMENT) =>
        {
            std::process::exit(if tts_service_supervisor::run_exact_host().is_ok() {
                0
            } else {
                1
            });
        }
        Some(argument)
            if argument == std::ffi::OsStr::new(tts_service_supervisor::PIPER_HOST_ARGUMENT) =>
        {
            std::process::exit(if tts_service_supervisor::run_piper_host().is_ok() {
                0
            } else {
                1
            });
        }
        Some(argument)
            if argument
                == std::ffi::OsStr::new(
                    tts_service_supervisor::BILINGUAL_PROFILE_HOST_ARGUMENT,
                ) =>
        {
            let profile_id = arguments.next();
            let language = arguments.next();
            std::process::exit(
                if profile_id
                    .as_deref()
                    .and_then(std::ffi::OsStr::to_str)
                    .zip(language.as_deref().and_then(std::ffi::OsStr::to_str))
                    .is_some_and(|(profile_id, language)| {
                        tts_service_supervisor::run_bilingual_profile_host(profile_id, language)
                            .is_ok()
                    })
                {
                    0
                } else {
                    1
                },
            );
        }
        Some(argument) if argument == std::ffi::OsStr::new(tts_service_handoff::HOST_ARGUMENT) => {
            std::process::exit(if tts_service_handoff::run_host().is_ok() {
                0
            } else {
                1
            });
        }
        _ => {}
    }

    let application = tauri::Builder::default()
        .manage(Arc::new(
            tts_service_supervisor::TtsServiceSupervisor::default(),
        ))
        .invoke_handler(tauri::generate_handler![
            host_profile_detection::detect_host_profile_compatibility,
            tts_protocol_probe::run_tts_protocol_probe,
            tts_service_supervisor::exact_tts_demo_available,
            tts_service_supervisor::tts_profile_configuration_available,
            tts_service_supervisor::start_tts_service,
            tts_service_supervisor::prepare_tts_service,
            tts_service_supervisor::health_tts_service,
            tts_service_supervisor::synthesize_tts_segment,
            tts_service_supervisor::cancel_tts_generation,
            tts_service_supervisor::shutdown_tts_service,
        ])
        .build(tauri::generate_context!())
        .expect("failed to build the VoxLeaf desktop shell");
    application.run(|handle, event| {
        if matches!(event, tauri::RunEvent::Exit) {
            handle
                .state::<Arc<tts_service_supervisor::TtsServiceSupervisor>>()
                .force_stop();
        }
    });
}
