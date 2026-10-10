#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Arc;

use tauri::Manager;

mod diagnostics;
#[cfg(test)]
mod hardware_profile_authority;
mod host_profile_detection;
mod sha256_hex;
mod tts_optional_chatterbox;
mod tts_protocol_contract;
mod tts_protocol_probe;
mod tts_release_core;
mod tts_service_fake_child;
mod tts_service_handoff;
mod tts_service_protocol;
mod tts_service_supervisor;

fn main() {
    diagnostics::cli::dispatch_if_requested();

    let application = tauri::Builder::default()
        .manage(Arc::new(
            tts_service_supervisor::TtsServiceSupervisor::default(),
        ))
        .manage(Arc::new(
            tts_optional_chatterbox::OptionalChatterboxManager::default(),
        ))
        .setup(|app| {
            tts_optional_chatterbox::configure_application_data_root(app.handle())
                .map_err(|_| "failed to configure optional-profile data root")?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            host_profile_detection::detect_host_profile_compatibility,
            tts_protocol_probe::run_tts_protocol_probe,
            tts_service_supervisor::exact_tts_demo_available,
            tts_service_supervisor::release_locked_runtime_enabled,
            tts_service_supervisor::tts_profile_configuration_available,
            tts_optional_chatterbox::optional_chatterbox_snapshot,
            tts_optional_chatterbox::select_optional_chatterbox,
            tts_optional_chatterbox::download_optional_chatterbox,
            tts_optional_chatterbox::cancel_optional_chatterbox,
            tts_optional_chatterbox::remove_optional_chatterbox,
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
