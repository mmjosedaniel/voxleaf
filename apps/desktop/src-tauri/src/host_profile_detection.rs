use std::sync::atomic::{AtomicBool, Ordering};

use serde::Serialize;

const SCHEMA_VERSION: u8 = 1;
const MEBIBYTE_BYTES: u64 = 1_048_576;
const MAXIMUM_LOGICAL_PROCESSORS: u64 = 1_024;
const MAXIMUM_QUANTITY_MIB: u64 = 16_777_216;
const MAXIMUM_NATIVE_ADAPTERS: usize = 64;

static HOST_PROBE_ACTIVE: AtomicBool = AtomicBool::new(false);

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "kebab-case")]
enum ProbeStatus {
    Complete,
    Partial,
    PermissionDenied,
    Unavailable,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "kebab-case")]
#[allow(dead_code)]
enum OperatingSystem {
    Windows,
    Linux,
    Macos,
    Other,
    Unknown,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[allow(dead_code)]
enum Architecture {
    #[serde(rename = "x86_64")]
    X86_64,
    #[serde(rename = "aarch64")]
    Aarch64,
    #[serde(rename = "other")]
    Other,
    #[serde(rename = "unknown")]
    Unknown,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "kebab-case")]
enum Availability {
    Available,
    Unavailable,
    Unknown,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "kebab-case")]
enum DeviceClass {
    Cpu,
    DiscreteGpu,
    #[cfg_attr(
        all(not(windows), not(test)),
        expect(
            dead_code,
            reason = "Constructed by the Windows probe and synthetic tests."
        )
    )]
    IntegratedGpu,
    #[cfg_attr(
        all(not(windows), not(test)),
        expect(
            dead_code,
            reason = "Constructed by the Windows probe and synthetic tests."
        )
    )]
    Software,
    Unknown,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[serde(tag = "status", rename_all = "kebab-case")]
enum Quantity {
    Known { value: u64 },
    Unknown,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
struct PlatformReport {
    operating_system: OperatingSystem,
    architecture: Architecture,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
struct ProcessorReport {
    logical_processor_count: Quantity,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
struct MemoryReport {
    total_physical_mi_b: Quantity,
    available_physical_mi_b: Quantity,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
struct StorageReport {
    application_volume_available_mi_b: Quantity,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
struct PrecisionReport {
    float32: Availability,
    float16: Availability,
    bfloat16: Availability,
    int8: Availability,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
struct ProviderReport {
    availability: Availability,
    device_class: DeviceClass,
    dedicated_memory_mi_b: Quantity,
    available_dedicated_memory_mi_b: Quantity,
    precisions: PrecisionReport,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
struct ProviderReports {
    cpu: ProviderReport,
    cuda: ProviderReport,
    directml: ProviderReport,
    rocm: ProviderReport,
    metal: ProviderReport,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HostProfileCompatibilityReportV1 {
    schema_version: u8,
    probe_status: ProbeStatus,
    platform: PlatformReport,
    processor: ProcessorReport,
    memory: MemoryReport,
    storage: StorageReport,
    providers: ProviderReports,
}

#[derive(Clone, Debug, Eq, PartialEq)]
enum ProbeValue<T> {
    #[cfg_attr(
        all(not(windows), not(test)),
        expect(
            dead_code,
            reason = "Constructed by the Windows probe and synthetic tests."
        )
    )]
    Known(T),
    Unknown,
    #[cfg_attr(
        all(not(windows), not(test)),
        expect(
            dead_code,
            reason = "Constructed by the Windows probe and synthetic tests."
        )
    )]
    PermissionDenied,
    Unavailable,
    #[cfg_attr(
        not(windows),
        expect(dead_code, reason = "Constructed only by the Windows probe.")
    )]
    Malformed,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
struct NativeMemory {
    total_bytes: u64,
    available_bytes: u64,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
struct NativeAdapter {
    luid: u64,
    device_class: DeviceClass,
    dedicated_memory_bytes: Option<u64>,
    available_dedicated_memory_bytes: Option<u64>,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
struct NativeProviderDevice {
    luid: u64,
    precisions: PrecisionReport,
}

#[derive(Clone, Debug, Eq, PartialEq)]
struct NativeHostSnapshot {
    platform_supported: bool,
    platform: PlatformReport,
    logical_processor_count: ProbeValue<u64>,
    memory: ProbeValue<NativeMemory>,
    application_volume_available_bytes: ProbeValue<u64>,
    adapters: ProbeValue<Vec<NativeAdapter>>,
    cuda_devices: ProbeValue<Vec<NativeProviderDevice>>,
    directml_devices: ProbeValue<Vec<NativeProviderDevice>>,
}

trait HostProbePort {
    fn snapshot(&self) -> NativeHostSnapshot;
}

#[derive(Default)]
struct ProbeStatusAccumulator {
    incomplete: bool,
    permission_denied: bool,
}

impl ProbeStatusAccumulator {
    fn observe_required<T>(&mut self, value: &ProbeValue<T>) {
        match value {
            ProbeValue::Known(_) => {}
            ProbeValue::PermissionDenied => self.permission_denied = true,
            ProbeValue::Unknown | ProbeValue::Unavailable | ProbeValue::Malformed => {
                self.incomplete = true;
            }
        }
    }

    fn observe_provider<T>(&mut self, value: &ProbeValue<T>) {
        match value {
            ProbeValue::Known(_) | ProbeValue::Unavailable => {}
            ProbeValue::PermissionDenied => self.permission_denied = true,
            ProbeValue::Unknown | ProbeValue::Malformed => self.incomplete = true,
        }
    }

    fn mark_incomplete(&mut self) {
        self.incomplete = true;
    }

    fn finish(self) -> ProbeStatus {
        if self.permission_denied {
            ProbeStatus::PermissionDenied
        } else if self.incomplete {
            ProbeStatus::Partial
        } else {
            ProbeStatus::Complete
        }
    }
}

struct ActiveProbeGuard;

impl ActiveProbeGuard {
    fn acquire() -> Result<Self, &'static str> {
        HOST_PROBE_ACTIVE
            .compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire)
            .map(|_| Self)
            .map_err(|_| "host-profile-probe-busy")
    }
}

impl Drop for ActiveProbeGuard {
    fn drop(&mut self) {
        HOST_PROBE_ACTIVE.store(false, Ordering::Release);
    }
}

fn unknown_precisions() -> PrecisionReport {
    PrecisionReport {
        float32: Availability::Unknown,
        float16: Availability::Unknown,
        bfloat16: Availability::Unknown,
        int8: Availability::Unknown,
    }
}

fn unavailable_precisions() -> PrecisionReport {
    PrecisionReport {
        float32: Availability::Unavailable,
        float16: Availability::Unavailable,
        bfloat16: Availability::Unavailable,
        int8: Availability::Unavailable,
    }
}

fn unknown_provider() -> ProviderReport {
    ProviderReport {
        availability: Availability::Unknown,
        device_class: DeviceClass::Unknown,
        dedicated_memory_mi_b: Quantity::Unknown,
        available_dedicated_memory_mi_b: Quantity::Unknown,
        precisions: unknown_precisions(),
    }
}

fn unavailable_provider() -> ProviderReport {
    ProviderReport {
        availability: Availability::Unavailable,
        device_class: DeviceClass::Unknown,
        dedicated_memory_mi_b: Quantity::Unknown,
        available_dedicated_memory_mi_b: Quantity::Unknown,
        precisions: unavailable_precisions(),
    }
}

fn quantity_from_bytes(bytes: u64) -> Option<Quantity> {
    let value = bytes / MEBIBYTE_BYTES;
    (value <= MAXIMUM_QUANTITY_MIB).then_some(Quantity::Known { value })
}

fn normalize_processor_count(
    value: &ProbeValue<u64>,
    status: &mut ProbeStatusAccumulator,
) -> Quantity {
    match value {
        ProbeValue::Known(value) if (1..=MAXIMUM_LOGICAL_PROCESSORS).contains(value) => {
            Quantity::Known { value: *value }
        }
        ProbeValue::Known(_) => {
            status.mark_incomplete();
            Quantity::Unknown
        }
        _ => Quantity::Unknown,
    }
}

fn normalize_memory(
    value: &ProbeValue<NativeMemory>,
    status: &mut ProbeStatusAccumulator,
) -> MemoryReport {
    let ProbeValue::Known(memory) = value else {
        return MemoryReport {
            total_physical_mi_b: Quantity::Unknown,
            available_physical_mi_b: Quantity::Unknown,
        };
    };
    let total = quantity_from_bytes(memory.total_bytes);
    let available = quantity_from_bytes(memory.available_bytes);
    if memory.total_bytes == 0 || memory.available_bytes > memory.total_bytes {
        status.mark_incomplete();
        return MemoryReport {
            total_physical_mi_b: Quantity::Unknown,
            available_physical_mi_b: Quantity::Unknown,
        };
    }
    match (total, available) {
        (Some(total), Some(available)) => MemoryReport {
            total_physical_mi_b: total,
            available_physical_mi_b: available,
        },
        _ => {
            status.mark_incomplete();
            MemoryReport {
                total_physical_mi_b: Quantity::Unknown,
                available_physical_mi_b: Quantity::Unknown,
            }
        }
    }
}

fn normalize_storage(
    value: &ProbeValue<u64>,
    status: &mut ProbeStatusAccumulator,
) -> StorageReport {
    let application_volume_available_mi_b = match value {
        ProbeValue::Known(bytes) => quantity_from_bytes(*bytes).unwrap_or_else(|| {
            status.mark_incomplete();
            Quantity::Unknown
        }),
        _ => Quantity::Unknown,
    };
    StorageReport {
        application_volume_available_mi_b,
    }
}

fn cpu_provider(logical_processor_count: Quantity) -> ProviderReport {
    match logical_processor_count {
        Quantity::Known { .. } => ProviderReport {
            availability: Availability::Available,
            device_class: DeviceClass::Cpu,
            dedicated_memory_mi_b: Quantity::Known { value: 0 },
            available_dedicated_memory_mi_b: Quantity::Known { value: 0 },
            precisions: PrecisionReport {
                float32: Availability::Available,
                float16: Availability::Unknown,
                bfloat16: Availability::Unknown,
                int8: Availability::Unknown,
            },
        },
        Quantity::Unknown => unknown_provider(),
    }
}

fn class_rank(value: DeviceClass) -> u8 {
    match value {
        DeviceClass::DiscreteGpu => 3,
        DeviceClass::IntegratedGpu => 2,
        DeviceClass::Software => 1,
        DeviceClass::Cpu | DeviceClass::Unknown => 0,
    }
}

fn provider_rank(value: &ProviderReport) -> (bool, u64, bool, u64, u8) {
    let available = match value.available_dedicated_memory_mi_b {
        Quantity::Known { value } => Some(value),
        Quantity::Unknown => None,
    };
    let dedicated = match value.dedicated_memory_mi_b {
        Quantity::Known { value } => Some(value),
        Quantity::Unknown => None,
    };
    (
        available.is_some(),
        available.unwrap_or(0),
        dedicated.is_some(),
        dedicated.unwrap_or(0),
        class_rank(value.device_class),
    )
}

fn provider_candidate(
    device: NativeProviderDevice,
    adapters: &[NativeAdapter],
) -> Option<ProviderReport> {
    let mut matching = adapters
        .iter()
        .filter(|adapter| adapter.luid == device.luid);
    let adapter = matching.next()?;
    if matching.next().is_some()
        || matches!(
            adapter.device_class,
            DeviceClass::Cpu | DeviceClass::Unknown
        )
    {
        return None;
    }
    if ![
        device.precisions.float32,
        device.precisions.float16,
        device.precisions.bfloat16,
        device.precisions.int8,
    ]
    .contains(&Availability::Available)
    {
        return None;
    }

    let dedicated_memory_mi_b = match adapter.dedicated_memory_bytes {
        Some(bytes) => quantity_from_bytes(bytes).unwrap_or(Quantity::Unknown),
        None => Quantity::Unknown,
    };
    let available_dedicated_memory_mi_b = match adapter.available_dedicated_memory_bytes {
        Some(bytes) => quantity_from_bytes(bytes).unwrap_or(Quantity::Unknown),
        None => Quantity::Unknown,
    };
    if let (Quantity::Known { value: dedicated }, Quantity::Known { value: available }) =
        (dedicated_memory_mi_b, available_dedicated_memory_mi_b)
        && available > dedicated
    {
        return None;
    }

    Some(ProviderReport {
        availability: Availability::Available,
        device_class: adapter.device_class,
        dedicated_memory_mi_b,
        available_dedicated_memory_mi_b,
        precisions: device.precisions,
    })
}

fn normalize_accelerated_provider(
    devices: &ProbeValue<Vec<NativeProviderDevice>>,
    adapters: &ProbeValue<Vec<NativeAdapter>>,
    status: &mut ProbeStatusAccumulator,
) -> ProviderReport {
    let ProbeValue::Known(devices) = devices else {
        return match devices {
            ProbeValue::Unavailable => unavailable_provider(),
            _ => unknown_provider(),
        };
    };
    if devices.is_empty() {
        return unavailable_provider();
    }
    let ProbeValue::Known(adapters) = adapters else {
        status.mark_incomplete();
        return unknown_provider();
    };
    if devices.len() > MAXIMUM_NATIVE_ADAPTERS || adapters.len() > MAXIMUM_NATIVE_ADAPTERS {
        status.mark_incomplete();
        return unknown_provider();
    }

    let mut selected: Option<ProviderReport> = None;
    let mut ambiguous = false;
    for device in devices {
        let Some(candidate) = provider_candidate(*device, adapters) else {
            continue;
        };
        match selected {
            None => selected = Some(candidate),
            Some(current) => match provider_rank(&candidate).cmp(&provider_rank(&current)) {
                std::cmp::Ordering::Greater => {
                    selected = Some(candidate);
                    ambiguous = false;
                }
                std::cmp::Ordering::Equal if candidate != current => ambiguous = true,
                _ => {}
            },
        }
    }
    if ambiguous {
        status.mark_incomplete();
        return unknown_provider();
    }
    let Some(selected) = selected else {
        status.mark_incomplete();
        return unknown_provider();
    };
    if matches!(
        (
            selected.dedicated_memory_mi_b,
            selected.available_dedicated_memory_mi_b,
        ),
        (Quantity::Unknown, _) | (_, Quantity::Unknown)
    ) {
        status.mark_incomplete();
    }
    selected
}

fn normalize_snapshot(snapshot: NativeHostSnapshot) -> HostProfileCompatibilityReportV1 {
    if !snapshot.platform_supported {
        return HostProfileCompatibilityReportV1 {
            schema_version: SCHEMA_VERSION,
            probe_status: ProbeStatus::Unavailable,
            platform: snapshot.platform,
            processor: ProcessorReport {
                logical_processor_count: Quantity::Unknown,
            },
            memory: MemoryReport {
                total_physical_mi_b: Quantity::Unknown,
                available_physical_mi_b: Quantity::Unknown,
            },
            storage: StorageReport {
                application_volume_available_mi_b: Quantity::Unknown,
            },
            providers: ProviderReports {
                cpu: unknown_provider(),
                cuda: unknown_provider(),
                directml: unknown_provider(),
                rocm: unknown_provider(),
                metal: unknown_provider(),
            },
        };
    }

    let mut status = ProbeStatusAccumulator::default();
    status.observe_required(&snapshot.logical_processor_count);
    status.observe_required(&snapshot.memory);
    status.observe_required(&snapshot.application_volume_available_bytes);
    status.observe_required(&snapshot.adapters);
    status.observe_provider(&snapshot.cuda_devices);
    status.observe_provider(&snapshot.directml_devices);

    let logical_processor_count =
        normalize_processor_count(&snapshot.logical_processor_count, &mut status);
    let memory = normalize_memory(&snapshot.memory, &mut status);
    let storage = normalize_storage(&snapshot.application_volume_available_bytes, &mut status);
    let cuda =
        normalize_accelerated_provider(&snapshot.cuda_devices, &snapshot.adapters, &mut status);
    let directml =
        normalize_accelerated_provider(&snapshot.directml_devices, &snapshot.adapters, &mut status);

    HostProfileCompatibilityReportV1 {
        schema_version: SCHEMA_VERSION,
        probe_status: status.finish(),
        platform: snapshot.platform,
        processor: ProcessorReport {
            logical_processor_count,
        },
        memory,
        storage,
        providers: ProviderReports {
            cpu: cpu_provider(logical_processor_count),
            cuda,
            directml,
            rocm: unavailable_provider(),
            metal: unavailable_provider(),
        },
    }
}

#[cfg(windows)]
mod windows_probe;

#[cfg(not(windows))]
struct UnsupportedHostProbe;

#[cfg(not(windows))]
impl HostProbePort for UnsupportedHostProbe {
    fn snapshot(&self) -> NativeHostSnapshot {
        NativeHostSnapshot {
            platform_supported: false,
            platform: PlatformReport {
                operating_system: if cfg!(target_os = "linux") {
                    OperatingSystem::Linux
                } else if cfg!(target_os = "macos") {
                    OperatingSystem::Macos
                } else {
                    OperatingSystem::Other
                },
                architecture: if cfg!(target_arch = "x86_64") {
                    Architecture::X86_64
                } else if cfg!(target_arch = "aarch64") {
                    Architecture::Aarch64
                } else {
                    Architecture::Other
                },
            },
            logical_processor_count: ProbeValue::Unavailable,
            memory: ProbeValue::Unavailable,
            application_volume_available_bytes: ProbeValue::Unavailable,
            adapters: ProbeValue::Unavailable,
            cuda_devices: ProbeValue::Unknown,
            directml_devices: ProbeValue::Unknown,
        }
    }
}

fn detect_host_profile() -> HostProfileCompatibilityReportV1 {
    #[cfg(windows)]
    {
        normalize_snapshot(windows_probe::WindowsHostProbe.snapshot())
    }
    #[cfg(not(windows))]
    {
        normalize_snapshot(UnsupportedHostProbe.snapshot())
    }
}

fn quantity_at_least(quantity: Quantity, required: u64) -> bool {
    matches!(quantity, Quantity::Known { value } if value >= required)
}

/// Apply the closed optional-profile hardware facts without returning the raw
/// host report to another native caller. The renderer's compatibility view is
/// explanatory only; acquisition independently rechecks this gate before it
/// is allowed to open a network connection.
pub(crate) fn optional_cuda_bf16_profile_admitted(
    minimum_logical_processors: u64,
    minimum_total_ram_mi_b: u64,
    minimum_available_ram_mi_b: u64,
    minimum_total_dedicated_vram_mi_b: u64,
    minimum_available_dedicated_vram_mi_b: u64,
) -> bool {
    optional_cuda_bf16_profile_admitted_from_report(
        detect_host_profile(),
        minimum_logical_processors,
        minimum_total_ram_mi_b,
        minimum_available_ram_mi_b,
        minimum_total_dedicated_vram_mi_b,
        minimum_available_dedicated_vram_mi_b,
    )
}

fn optional_cuda_bf16_profile_admitted_from_report(
    report: HostProfileCompatibilityReportV1,
    minimum_logical_processors: u64,
    minimum_total_ram_mi_b: u64,
    minimum_available_ram_mi_b: u64,
    minimum_total_dedicated_vram_mi_b: u64,
    minimum_available_dedicated_vram_mi_b: u64,
) -> bool {
    let cuda = report.providers.cuda;
    report.schema_version == SCHEMA_VERSION
        && report.platform.operating_system == OperatingSystem::Windows
        && report.platform.architecture == Architecture::X86_64
        && quantity_at_least(
            report.processor.logical_processor_count,
            minimum_logical_processors,
        )
        && quantity_at_least(report.memory.total_physical_mi_b, minimum_total_ram_mi_b)
        && quantity_at_least(
            report.memory.available_physical_mi_b,
            minimum_available_ram_mi_b,
        )
        && cuda.availability == Availability::Available
        && cuda.device_class == DeviceClass::DiscreteGpu
        && cuda.precisions.bfloat16 == Availability::Available
        && quantity_at_least(
            cuda.dedicated_memory_mi_b,
            minimum_total_dedicated_vram_mi_b,
        )
        && quantity_at_least(
            cuda.available_dedicated_memory_mi_b,
            minimum_available_dedicated_vram_mi_b,
        )
}

#[tauri::command]
pub async fn detect_host_profile_compatibility()
-> Result<HostProfileCompatibilityReportV1, &'static str> {
    tauri::async_runtime::spawn_blocking(|| {
        let _guard = ActiveProbeGuard::acquire()?;
        Ok(detect_host_profile())
    })
    .await
    .map_err(|_| "host-profile-probe-internal-failure")?
}

#[cfg(test)]
mod tests;
