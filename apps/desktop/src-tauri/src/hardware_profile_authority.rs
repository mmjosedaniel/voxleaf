#[cfg(test)]
mod tests {
    use std::collections::BTreeSet;

    use serde_json::Value;

    const HOST_PROFILE_SCHEMA: &str = include_str!(
        "../../../../packages/shared/schemas/host-profile-compatibility-report/v1.schema.json"
    );
    const SYNTHETIC_REPORT: &str = include_str!(
        "../../../../packages/shared/fixtures/contracts/host-profile-compatibility-report/v1/valid-synthetic.json"
    );
    const UNKNOWN_REPORT: &str = include_str!(
        "../../../../packages/shared/fixtures/contracts/host-profile-compatibility-report/v1/valid-unknown.json"
    );
    const TAURI_CONFIG: &str = include_str!("../tauri.conf.json");
    const CARGO_MANIFEST: &str = include_str!("../Cargo.toml");

    const SELECTED_WINDOWS_PROBE_SURFACES: [&str; 6] = [
        "GetNativeSystemInfo",
        "GetActiveProcessorCount",
        "GlobalMemoryStatusEx",
        "GetDiskFreeSpaceExW",
        "DXGI adapter and QueryVideoMemoryInfo",
        "bounded callable provider API",
    ];
    const FORBIDDEN_PROBE_SURFACES: [&str; 8] = [
        "PowerShell",
        "WMI query text",
        "nvidia-smi",
        "wmic",
        "general shell command",
        "registry inventory",
        "remote endpoint",
        "raw vendor output",
    ];
    const PROVIDERS: [&str; 5] = ["cpu", "cuda", "directml", "rocm", "metal"];
    const FORBIDDEN_FIELDS: [&str; 12] = [
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
        "bookText",
        "generatedAudio",
    ];

    fn parse(input: &str) -> Value {
        serde_json::from_str(input).expect("authority JSON must parse")
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
    fn freezes_native_probe_surfaces_without_shell_or_remote_fallback() {
        assert_eq!(
            SELECTED_WINDOWS_PROBE_SURFACES,
            [
                "GetNativeSystemInfo",
                "GetActiveProcessorCount",
                "GlobalMemoryStatusEx",
                "GetDiskFreeSpaceExW",
                "DXGI adapter and QueryVideoMemoryInfo",
                "bounded callable provider API",
            ]
        );
        assert!(FORBIDDEN_PROBE_SURFACES.contains(&"PowerShell"));
        assert!(FORBIDDEN_PROBE_SURFACES.contains(&"nvidia-smi"));
        assert!(FORBIDDEN_PROBE_SURFACES.contains(&"remote endpoint"));
    }

    #[test]
    fn current_tauri_boundary_has_no_plugin_or_renderer_capability() {
        let config = parse(TAURI_CONFIG);
        assert_eq!(
            config
                .pointer("/app/security/capabilities")
                .and_then(Value::as_array)
                .map(Vec::len),
            Some(0)
        );
        for forbidden in [
            "tauri-plugin-shell",
            "tauri-plugin-process",
            "tauri-plugin-http",
            "tauri-plugin-os",
        ] {
            assert!(!CARGO_MANIFEST.contains(forbidden));
        }
        assert!(CARGO_MANIFEST.contains("windows-sys"));
    }

    #[test]
    fn canonical_schema_freezes_exact_units_maxima_and_provider_set() {
        let schema = parse(HOST_PROFILE_SCHEMA);
        assert_eq!(
            schema
                .pointer("/$defs/knownLogicalProcessorCount/oneOf/0/properties/value/maximum")
                .and_then(Value::as_u64),
            Some(1_024)
        );
        assert_eq!(
            schema
                .pointer("/$defs/knownNonNegativeMebibytes/oneOf/0/properties/value/maximum")
                .and_then(Value::as_u64),
            Some(16_777_216)
        );
        assert_eq!(
            schema
                .pointer("/properties/providers/required")
                .and_then(Value::as_array)
                .map(|providers| {
                    providers
                        .iter()
                        .filter_map(Value::as_str)
                        .collect::<BTreeSet<_>>()
                }),
            Some(PROVIDERS.into_iter().collect())
        );
        assert_eq!(
            schema
                .pointer("/properties/probeStatus/enum")
                .and_then(Value::as_array)
                .map(Vec::len),
            Some(4)
        );
    }

    #[test]
    fn committed_reports_are_content_free_and_identity_free() {
        for fixture in [SYNTHETIC_REPORT, UNKNOWN_REPORT] {
            let report = parse(fixture);
            let mut keys = BTreeSet::new();
            collect_keys(&report, &mut keys);
            for forbidden in FORBIDDEN_FIELDS {
                assert!(!keys.contains(forbidden), "forbidden field: {forbidden}");
            }
            assert_eq!(report.get("schemaVersion").and_then(Value::as_u64), Some(1));
            assert!(report.get("recommendation").is_none());
            assert!(report.get("supportState").is_none());
        }
    }
}
