#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(test)]
mod tts_protocol_contract;
mod tts_protocol_probe;

fn main() {
    match std::env::args_os().nth(1).as_deref() {
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
        _ => {}
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            tts_protocol_probe::run_tts_protocol_probe
        ])
        .run(tauri::generate_context!())
        .expect("failed to run the VoxLeaf desktop shell");
}
