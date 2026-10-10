use std::collections::BTreeSet;

use serde_json::Value;

use super::*;

struct InjectedProbe(NativeHostSnapshot);

impl HostProbePort for InjectedProbe {
    fn snapshot(&self) -> NativeHostSnapshot {
        self.0.clone()
    }
}

fn gibibytes(value: u64) -> u64 {
    value * 1_024 * MEBIBYTE_BYTES
}

fn mebibytes(value: u64) -> u64 {
    value * MEBIBYTE_BYTES
}

fn directml_precisions() -> PrecisionReport {
    PrecisionReport {
        float32: Availability::Available,
        float16: Availability::Available,
        bfloat16: Availability::Unavailable,
        int8: Availability::Available,
    }
}

fn cuda_precisions() -> PrecisionReport {
    PrecisionReport {
        float32: Availability::Available,
        float16: Availability::Available,
        bfloat16: Availability::Available,
        int8: Availability::Unknown,
    }
}

fn complete_snapshot() -> NativeHostSnapshot {
    NativeHostSnapshot {
        platform_supported: true,
        platform: PlatformReport {
            operating_system: OperatingSystem::Windows,
            architecture: Architecture::X86_64,
        },
        logical_processor_count: ProbeValue::Known(12),
        memory: ProbeValue::Known(NativeMemory {
            total_bytes: gibibytes(24),
            available_bytes: gibibytes(16),
        }),
        application_volume_available_bytes: ProbeValue::Known(gibibytes(40)),
        adapters: ProbeValue::Known(vec![NativeAdapter {
            luid: 1,
            device_class: DeviceClass::DiscreteGpu,
            dedicated_memory_bytes: Some(gibibytes(12)),
            available_dedicated_memory_bytes: Some(gibibytes(9)),
        }]),
        cuda_devices: ProbeValue::Known(vec![NativeProviderDevice {
            luid: 1,
            precisions: cuda_precisions(),
        }]),
        directml_devices: ProbeValue::Unavailable,
    }
}

fn threshold_optional_snapshot() -> NativeHostSnapshot {
    let mut snapshot = complete_snapshot();
    snapshot.logical_processor_count = ProbeValue::Known(8);
    snapshot.memory = ProbeValue::Known(NativeMemory {
        total_bytes: mebibytes(24_576),
        available_bytes: mebibytes(4_096),
    });
    snapshot.adapters = ProbeValue::Known(vec![NativeAdapter {
        luid: 1,
        device_class: DeviceClass::DiscreteGpu,
        dedicated_memory_bytes: Some(mebibytes(5_632)),
        available_dedicated_memory_bytes: Some(mebibytes(4_668)),
    }]);
    snapshot
}

fn optional_profile_admitted(snapshot: NativeHostSnapshot) -> bool {
    optional_cuda_bf16_profile_admitted_from_report(
        normalize_snapshot(snapshot),
        8,
        24_576,
        4_096,
        5_632,
        4_668,
    )
}

#[test]
fn optional_download_gate_accepts_every_exact_numeric_threshold() {
    assert!(optional_profile_admitted(threshold_optional_snapshot()));
}

#[test]
fn optional_download_gate_rejects_one_below_every_numeric_threshold() {
    let mut insufficient = threshold_optional_snapshot();
    insufficient.logical_processor_count = ProbeValue::Known(7);
    assert!(!optional_profile_admitted(insufficient));

    let mut insufficient = threshold_optional_snapshot();
    insufficient.memory = ProbeValue::Known(NativeMemory {
        total_bytes: mebibytes(24_575),
        available_bytes: mebibytes(4_096),
    });
    assert!(!optional_profile_admitted(insufficient));

    let mut insufficient = threshold_optional_snapshot();
    insufficient.memory = ProbeValue::Known(NativeMemory {
        total_bytes: mebibytes(24_576),
        available_bytes: mebibytes(4_095),
    });
    assert!(!optional_profile_admitted(insufficient));

    let mut insufficient = threshold_optional_snapshot();
    insufficient.adapters = ProbeValue::Known(vec![NativeAdapter {
        luid: 1,
        device_class: DeviceClass::DiscreteGpu,
        dedicated_memory_bytes: Some(mebibytes(5_631)),
        available_dedicated_memory_bytes: Some(mebibytes(4_668)),
    }]);
    assert!(!optional_profile_admitted(insufficient));

    let mut insufficient = threshold_optional_snapshot();
    insufficient.adapters = ProbeValue::Known(vec![NativeAdapter {
        luid: 1,
        device_class: DeviceClass::DiscreteGpu,
        dedicated_memory_bytes: Some(mebibytes(5_632)),
        available_dedicated_memory_bytes: Some(mebibytes(4_667)),
    }]);
    assert!(!optional_profile_admitted(insufficient));
}

#[test]
fn optional_download_gate_fails_closed_for_each_unknown_capacity() {
    let mut unknown = threshold_optional_snapshot();
    unknown.logical_processor_count = ProbeValue::Unknown;
    assert!(!optional_profile_admitted(unknown));

    let mut unknown = threshold_optional_snapshot();
    unknown.memory = ProbeValue::Unknown;
    assert!(!optional_profile_admitted(unknown));

    let mut unknown = threshold_optional_snapshot();
    unknown.adapters = ProbeValue::Known(vec![NativeAdapter {
        luid: 1,
        device_class: DeviceClass::DiscreteGpu,
        dedicated_memory_bytes: None,
        available_dedicated_memory_bytes: Some(mebibytes(4_668)),
    }]);
    assert!(!optional_profile_admitted(unknown));

    let mut unknown = threshold_optional_snapshot();
    unknown.adapters = ProbeValue::Known(vec![NativeAdapter {
        luid: 1,
        device_class: DeviceClass::DiscreteGpu,
        dedicated_memory_bytes: Some(mebibytes(5_632)),
        available_dedicated_memory_bytes: None,
    }]);
    assert!(!optional_profile_admitted(unknown));
}

#[test]
fn optional_download_gate_requires_the_closed_platform_cuda_and_bfloat16_facts() {
    assert!(optional_profile_admitted(threshold_optional_snapshot()));

    let mut unsupported = threshold_optional_snapshot();
    unsupported.platform.operating_system = OperatingSystem::Other;
    assert!(!optional_profile_admitted(unsupported));

    let mut unsupported = threshold_optional_snapshot();
    unsupported.platform.architecture = Architecture::Aarch64;
    assert!(!optional_profile_admitted(unsupported));

    let mut unsupported = threshold_optional_snapshot();
    if let ProbeValue::Known(adapters) = &mut unsupported.adapters {
        adapters[0].device_class = DeviceClass::IntegratedGpu;
    }
    assert!(!optional_profile_admitted(unsupported));

    let mut unsupported = threshold_optional_snapshot();
    if let ProbeValue::Known(devices) = &mut unsupported.cuda_devices {
        devices[0].precisions.bfloat16 = Availability::Unavailable;
    }
    assert!(!optional_profile_admitted(unsupported));

    let mut unknown = threshold_optional_snapshot();
    unknown.cuda_devices = ProbeValue::Unknown;
    assert!(!optional_profile_admitted(unknown));
}

fn report(snapshot: NativeHostSnapshot) -> HostProfileCompatibilityReportV1 {
    normalize_snapshot(InjectedProbe(snapshot).snapshot())
}

fn collect_keys(value: &Value, keys: &mut BTreeSet<String>) {
    match value {
        Value::Array(values) => {
            for value in values {
                collect_keys(value, keys);
            }
        }
        Value::Object(object) => {
            for (key, value) in object {
                keys.insert(key.clone());
                collect_keys(value, keys);
            }
        }
        _ => {}
    }
}

#[test]
fn normalizes_complete_snapshot_without_identity_or_support_claims() {
    let report = report(complete_snapshot());
    assert_eq!(report.schema_version, 1);
    assert_eq!(report.probe_status, ProbeStatus::Complete);
    assert_eq!(
        report.processor.logical_processor_count,
        Quantity::Known { value: 12 }
    );
    assert_eq!(
        report.providers.cuda.available_dedicated_memory_mi_b,
        Quantity::Known { value: 9_216 }
    );
    let value = serde_json::to_value(report).expect("report should serialize");
    assert_eq!(
        value
            .as_object()
            .expect("report should be an object")
            .keys()
            .map(String::as_str)
            .collect::<BTreeSet<_>>(),
        BTreeSet::from([
            "memory",
            "platform",
            "probeStatus",
            "processor",
            "providers",
            "schemaVersion",
            "storage",
        ])
    );
    assert_eq!(
        value["memory"]
            .as_object()
            .expect("memory should be an object")
            .keys()
            .map(String::as_str)
            .collect::<BTreeSet<_>>(),
        BTreeSet::from(["availablePhysicalMiB", "totalPhysicalMiB"])
    );
    assert_eq!(
        value["providers"]["cuda"]
            .as_object()
            .expect("provider should be an object")
            .keys()
            .map(String::as_str)
            .collect::<BTreeSet<_>>(),
        BTreeSet::from([
            "availability",
            "availableDedicatedMemoryMiB",
            "dedicatedMemoryMiB",
            "deviceClass",
            "precisions",
        ])
    );
    let mut keys = BTreeSet::new();
    collect_keys(&value, &mut keys);
    for forbidden in [
        "hostname",
        "username",
        "deviceName",
        "serialNumber",
        "vendorId",
        "deviceId",
        "adapterLuid",
        "path",
        "commandLine",
        "environment",
        "timestamp",
        "recommendation",
        "supportState",
        "bookText",
        "generatedAudio",
    ] {
        assert!(!keys.contains(forbidden), "forbidden field: {forbidden}");
    }
}

#[test]
fn distinguishes_partial_permission_denied_and_malformed_observations() {
    let mut partial = complete_snapshot();
    partial.memory = ProbeValue::Unknown;
    let partial = report(partial);
    assert_eq!(partial.probe_status, ProbeStatus::Partial);
    assert_eq!(partial.memory.total_physical_mi_b, Quantity::Unknown);

    let mut denied = complete_snapshot();
    denied.application_volume_available_bytes = ProbeValue::PermissionDenied;
    let denied = report(denied);
    assert_eq!(denied.probe_status, ProbeStatus::PermissionDenied);
    assert_eq!(
        denied.storage.application_volume_available_mi_b,
        Quantity::Unknown
    );

    let mut malformed = complete_snapshot();
    malformed.memory = ProbeValue::Known(NativeMemory {
        total_bytes: gibibytes(8),
        available_bytes: gibibytes(9),
    });
    let malformed = report(malformed);
    assert_eq!(malformed.probe_status, ProbeStatus::Partial);
    assert_eq!(malformed.memory.total_physical_mi_b, Quantity::Unknown);
}

#[test]
fn selects_one_conservative_multi_adapter_candidate() {
    let mut snapshot = complete_snapshot();
    snapshot.adapters = ProbeValue::Known(vec![
        NativeAdapter {
            luid: 1,
            device_class: DeviceClass::DiscreteGpu,
            dedicated_memory_bytes: Some(gibibytes(12)),
            available_dedicated_memory_bytes: Some(gibibytes(6)),
        },
        NativeAdapter {
            luid: 2,
            device_class: DeviceClass::DiscreteGpu,
            dedicated_memory_bytes: Some(gibibytes(10)),
            available_dedicated_memory_bytes: Some(gibibytes(8)),
        },
    ]);
    snapshot.cuda_devices = ProbeValue::Known(vec![
        NativeProviderDevice {
            luid: 1,
            precisions: cuda_precisions(),
        },
        NativeProviderDevice {
            luid: 2,
            precisions: cuda_precisions(),
        },
    ]);
    let report = report(snapshot);
    assert_eq!(report.probe_status, ProbeStatus::Complete);
    assert_eq!(
        report.providers.cuda.dedicated_memory_mi_b,
        Quantity::Known { value: 10_240 }
    );
    assert_eq!(
        report.providers.cuda.available_dedicated_memory_mi_b,
        Quantity::Known { value: 8_192 }
    );
}

#[test]
fn discarded_unusable_adapter_does_not_poison_a_known_provider() {
    let mut snapshot = complete_snapshot();
    snapshot.adapters = ProbeValue::Known(vec![
        NativeAdapter {
            luid: 1,
            device_class: DeviceClass::DiscreteGpu,
            dedicated_memory_bytes: Some(gibibytes(12)),
            available_dedicated_memory_bytes: Some(gibibytes(9)),
        },
        NativeAdapter {
            luid: 2,
            device_class: DeviceClass::Software,
            dedicated_memory_bytes: None,
            available_dedicated_memory_bytes: None,
        },
    ]);
    snapshot.directml_devices = ProbeValue::Known(vec![
        NativeProviderDevice {
            luid: 1,
            precisions: directml_precisions(),
        },
        NativeProviderDevice {
            luid: 2,
            precisions: directml_precisions(),
        },
    ]);

    let report = report(snapshot);

    assert_eq!(report.probe_status, ProbeStatus::Complete);
    assert_eq!(
        report.providers.directml.dedicated_memory_mi_b,
        Quantity::Known { value: 12_288 }
    );
}

#[test]
fn selected_provider_with_unknown_memory_remains_partial() {
    let mut snapshot = complete_snapshot();
    snapshot.adapters = ProbeValue::Known(vec![NativeAdapter {
        luid: 1,
        device_class: DeviceClass::DiscreteGpu,
        dedicated_memory_bytes: None,
        available_dedicated_memory_bytes: None,
    }]);

    let report = report(snapshot);

    assert_eq!(report.probe_status, ProbeStatus::Partial);
    assert_eq!(
        report.providers.cuda.dedicated_memory_mi_b,
        Quantity::Unknown
    );
}

#[test]
fn preserves_integrated_only_low_memory_and_no_provider_scenarios() {
    let mut integrated = complete_snapshot();
    integrated.memory = ProbeValue::Known(NativeMemory {
        total_bytes: gibibytes(4),
        available_bytes: gibibytes(1),
    });
    integrated.adapters = ProbeValue::Known(vec![NativeAdapter {
        luid: 3,
        device_class: DeviceClass::IntegratedGpu,
        dedicated_memory_bytes: Some(0),
        available_dedicated_memory_bytes: Some(0),
    }]);
    integrated.cuda_devices = ProbeValue::Unavailable;
    integrated.directml_devices = ProbeValue::Known(vec![NativeProviderDevice {
        luid: 3,
        precisions: directml_precisions(),
    }]);
    let integrated = report(integrated);
    assert_eq!(integrated.probe_status, ProbeStatus::Complete);
    assert_eq!(
        integrated.memory.available_physical_mi_b,
        Quantity::Known { value: 1_024 }
    );
    assert_eq!(
        integrated.providers.directml.device_class,
        DeviceClass::IntegratedGpu
    );
    assert_eq!(
        integrated.providers.directml.dedicated_memory_mi_b,
        Quantity::Known { value: 0 }
    );

    let mut no_provider = complete_snapshot();
    no_provider.adapters = ProbeValue::Known(Vec::new());
    no_provider.cuda_devices = ProbeValue::Unavailable;
    no_provider.directml_devices = ProbeValue::Unavailable;
    let no_provider = report(no_provider);
    assert_eq!(no_provider.probe_status, ProbeStatus::Complete);
    assert_eq!(
        no_provider.providers.cuda.availability,
        Availability::Unavailable
    );
    assert_eq!(
        no_provider.providers.directml.availability,
        Availability::Unavailable
    );
}

#[test]
fn fails_closed_for_unknown_provider_and_ambiguous_exact_tie() {
    let mut unknown = complete_snapshot();
    unknown.cuda_devices = ProbeValue::Unknown;
    let unknown = report(unknown);
    assert_eq!(unknown.probe_status, ProbeStatus::Partial);
    assert_eq!(unknown.providers.cuda.availability, Availability::Unknown);

    let mut tied = complete_snapshot();
    tied.adapters = ProbeValue::Known(vec![
        NativeAdapter {
            luid: 4,
            device_class: DeviceClass::DiscreteGpu,
            dedicated_memory_bytes: Some(gibibytes(8)),
            available_dedicated_memory_bytes: Some(gibibytes(6)),
        },
        NativeAdapter {
            luid: 5,
            device_class: DeviceClass::DiscreteGpu,
            dedicated_memory_bytes: Some(gibibytes(8)),
            available_dedicated_memory_bytes: Some(gibibytes(6)),
        },
    ]);
    tied.cuda_devices = ProbeValue::Known(vec![
        NativeProviderDevice {
            luid: 4,
            precisions: cuda_precisions(),
        },
        NativeProviderDevice {
            luid: 5,
            precisions: PrecisionReport {
                bfloat16: Availability::Unavailable,
                ..cuda_precisions()
            },
        },
    ]);
    let tied = report(tied);
    assert_eq!(tied.probe_status, ProbeStatus::Partial);
    assert_eq!(tied.providers.cuda.availability, Availability::Unknown);
}

#[test]
fn unsupported_platform_is_explicitly_unavailable() {
    let report = normalize_snapshot(NativeHostSnapshot {
        platform_supported: false,
        platform: PlatformReport {
            operating_system: OperatingSystem::Linux,
            architecture: Architecture::Aarch64,
        },
        logical_processor_count: ProbeValue::Unavailable,
        memory: ProbeValue::Unavailable,
        application_volume_available_bytes: ProbeValue::Unavailable,
        adapters: ProbeValue::Unavailable,
        cuda_devices: ProbeValue::Unknown,
        directml_devices: ProbeValue::Unknown,
    });
    assert_eq!(report.probe_status, ProbeStatus::Unavailable);
    assert_eq!(report.platform.operating_system, OperatingSystem::Linux);
    assert_eq!(report.providers.cpu.availability, Availability::Unknown);
}

#[test]
fn admits_only_one_concurrent_probe_and_releases_the_guard() {
    let first = ActiveProbeGuard::acquire().expect("first probe should start");
    assert_eq!(
        ActiveProbeGuard::acquire().err(),
        Some("host-profile-probe-busy")
    );
    drop(first);
    assert!(ActiveProbeGuard::acquire().is_ok());
}

#[test]
fn implementation_has_no_process_network_model_or_persistence_surface() {
    let sources = [
        include_str!("../host_profile_detection.rs"),
        include_str!("windows_probe.rs"),
        include_str!("tests.rs"),
    ];
    let forbidden = [
        ["std::process::", "Command"].concat(),
        ["Tcp", "Stream"].concat(),
        ["Udp", "Socket"].concat(),
        ["req", "west"].concat(),
        ["http", "://"].concat(),
        ["https", "://"].concat(),
        ["std::", "fs::"].concat(),
        ["File::", "create"].concat(),
        ["Open", "Options"].concat(),
        ["local", "Storage"].concat(),
        ["write", "_all"].concat(),
        ["Power", "Shell"].concat(),
        ["nvidia", "-smi"].concat(),
        ["wm", "ic"].concat(),
        ["Win32::System::", "Registry"].concat(),
        ["qwen", "_tts"].concat(),
        ["import ", "torch"].concat(),
    ];
    for forbidden in forbidden {
        for source in sources {
            assert!(
                !source.contains(&forbidden),
                "forbidden surface: {forbidden}"
            );
        }
    }
}

#[cfg(windows)]
#[test]
fn production_windows_probe_emits_only_the_bounded_report() {
    let report = detect_host_profile();
    let value = serde_json::to_value(report).expect("report should serialize");
    assert_eq!(value.get("schemaVersion").and_then(Value::as_u64), Some(1));
    assert_eq!(
        value
            .get("providers")
            .and_then(Value::as_object)
            .map(|providers| providers.len()),
        Some(5)
    );
    assert!(value.get("recommendation").is_none());
    assert!(value.get("timestamp").is_none());
}
