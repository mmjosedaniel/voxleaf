use crate::{
    tts_protocol_probe, tts_service_fake_child, tts_service_handoff, tts_service_supervisor,
};

fn exit_with_diagnostic_status(succeeded: bool) -> ! {
    std::process::exit(if succeeded { 0 } else { 1 })
}

pub(crate) fn dispatch_if_requested() {
    let mut arguments = std::env::args_os();
    let _executable = arguments.next();
    match arguments.next().as_deref() {
        Some(argument) if argument == std::ffi::OsStr::new(tts_protocol_probe::CHILD_ARGUMENT) => {
            exit_with_diagnostic_status(tts_protocol_probe::run_child().is_ok());
        }
        Some(argument) if argument == std::ffi::OsStr::new(tts_protocol_probe::HOST_ARGUMENT) => {
            exit_with_diagnostic_status(tts_protocol_probe::run_host().is_ok());
        }
        Some(argument)
            if argument == std::ffi::OsStr::new(tts_service_fake_child::CHILD_ARGUMENT) =>
        {
            let scenario = arguments.next();
            exit_with_diagnostic_status(
                tts_service_fake_child::run_child(
                    scenario.as_deref().and_then(std::ffi::OsStr::to_str),
                )
                .is_ok(),
            );
        }
        Some(argument)
            if argument == std::ffi::OsStr::new(tts_service_fake_child::DESCENDANT_ARGUMENT) =>
        {
            exit_with_diagnostic_status(tts_service_fake_child::run_descendant().is_ok());
        }
        Some(argument)
            if argument == std::ffi::OsStr::new(tts_service_supervisor::HOST_ARGUMENT) =>
        {
            exit_with_diagnostic_status(tts_service_supervisor::run_host().is_ok());
        }
        Some(argument)
            if argument == std::ffi::OsStr::new(tts_service_supervisor::EXACT_HOST_ARGUMENT) =>
        {
            exit_with_diagnostic_status(tts_service_supervisor::run_exact_host().is_ok());
        }
        Some(argument)
            if argument == std::ffi::OsStr::new(tts_service_supervisor::PIPER_HOST_ARGUMENT) =>
        {
            exit_with_diagnostic_status(tts_service_supervisor::run_piper_host().is_ok());
        }
        Some(argument)
            if argument
                == std::ffi::OsStr::new(
                    tts_service_supervisor::BILINGUAL_PROFILE_HOST_ARGUMENT,
                ) =>
        {
            let profile_id = arguments.next();
            let language = arguments.next();
            exit_with_diagnostic_status(
                profile_id
                    .as_deref()
                    .and_then(std::ffi::OsStr::to_str)
                    .zip(language.as_deref().and_then(std::ffi::OsStr::to_str))
                    .is_some_and(|(profile_id, language)| {
                        tts_service_supervisor::run_bilingual_profile_host(profile_id, language)
                            .is_ok()
                    }),
            );
        }
        Some(argument) if argument == std::ffi::OsStr::new(tts_service_handoff::HOST_ARGUMENT) => {
            exit_with_diagnostic_status(tts_service_handoff::run_host().is_ok());
        }
        _ => {}
    }
}
