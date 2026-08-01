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
    IntegratedGpu,
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
    Known(T),
    Unknown,
    PermissionDenied,
    Unavailable,
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
mod windows_probe {
    use std::ffi::c_void;
    use std::mem::size_of;
    use std::os::windows::ffi::OsStrExt;
    use std::path::Path;

    use windows::Win32::AI::MachineLearning::DirectML::{
        DML_CREATE_DEVICE_FLAG_NONE, DML_FEATURE_DATA_TENSOR_DATA_TYPE_SUPPORT,
        DML_FEATURE_QUERY_TENSOR_DATA_TYPE_SUPPORT, DML_FEATURE_TENSOR_DATA_TYPE_SUPPORT,
        DML_TENSOR_DATA_TYPE, DML_TENSOR_DATA_TYPE_FLOAT16, DML_TENSOR_DATA_TYPE_FLOAT32,
        DML_TENSOR_DATA_TYPE_INT8, DMLCreateDevice, IDMLDevice,
    };
    use windows::Win32::Foundation::{E_ACCESSDENIED, FreeLibrary, HMODULE};
    use windows::Win32::Graphics::Direct3D::D3D_FEATURE_LEVEL_11_0;
    use windows::Win32::Graphics::Direct3D12::{D3D12CreateDevice, ID3D12Device};
    use windows::Win32::Graphics::Dxgi::{
        CreateDXGIFactory1, DXGI_ADAPTER_FLAG_SOFTWARE, DXGI_ERROR_NOT_FOUND,
        DXGI_MEMORY_SEGMENT_GROUP_LOCAL, DXGI_QUERY_VIDEO_MEMORY_INFO, IDXGIAdapter1,
        IDXGIAdapter3, IDXGIFactory1,
    };
    use windows::Win32::Storage::FileSystem::GetDiskFreeSpaceExW;
    use windows::Win32::System::LibraryLoader::{
        GetProcAddress, LOAD_LIBRARY_SEARCH_SYSTEM32, LoadLibraryExW,
    };
    use windows::Win32::System::SystemInformation::{
        GetNativeSystemInfo, GlobalMemoryStatusEx, MEMORYSTATUSEX, PROCESSOR_ARCHITECTURE_AMD64,
        PROCESSOR_ARCHITECTURE_ARM64, SYSTEM_INFO,
    };
    use windows::Win32::System::Threading::{ALL_PROCESSOR_GROUPS, GetActiveProcessorCount};
    use windows::core::{Interface, PCSTR, w};

    use super::{
        Architecture, Availability, DeviceClass, HostProbePort, MAXIMUM_NATIVE_ADAPTERS,
        NativeAdapter, NativeHostSnapshot, NativeMemory, NativeProviderDevice, OperatingSystem,
        PlatformReport, PrecisionReport, ProbeValue,
    };

    const CUDA_SUCCESS: i32 = 0;
    type CuInit = unsafe extern "system" fn(u32) -> i32;
    type CuDeviceGetCount = unsafe extern "system" fn(*mut i32) -> i32;
    type CuDeviceGet = unsafe extern "system" fn(*mut i32, i32) -> i32;
    type CuDeviceComputeCapability = unsafe extern "system" fn(*mut i32, *mut i32, i32) -> i32;
    type CuDeviceGetLuid = unsafe extern "system" fn(*mut i8, *mut u32, i32) -> i32;

    pub(super) struct WindowsHostProbe;

    struct CudaLibrary(HMODULE);

    impl Drop for CudaLibrary {
        fn drop(&mut self) {
            unsafe {
                let _ = FreeLibrary(self.0);
            }
        }
    }

    impl CudaLibrary {
        fn load() -> Result<Self, windows::core::Error> {
            unsafe {
                LoadLibraryExW(w!("nvcuda.dll"), None, LOAD_LIBRARY_SEARCH_SYSTEM32).map(Self)
            }
        }

        unsafe fn procedure<T: Copy>(&self, name: PCSTR) -> Option<T> {
            let procedure = unsafe { GetProcAddress(self.0, name) }?;
            Some(unsafe { std::mem::transmute_copy(&procedure) })
        }
    }

    fn classify_error<T>(error: windows::core::Error) -> ProbeValue<T> {
        if error.code() == E_ACCESSDENIED {
            ProbeValue::PermissionDenied
        } else {
            ProbeValue::Unknown
        }
    }

    fn platform() -> PlatformReport {
        let mut information = SYSTEM_INFO::default();
        unsafe {
            GetNativeSystemInfo(&mut information);
        }
        let architecture = match unsafe { information.Anonymous.Anonymous.wProcessorArchitecture } {
            PROCESSOR_ARCHITECTURE_AMD64 => Architecture::X86_64,
            PROCESSOR_ARCHITECTURE_ARM64 => Architecture::Aarch64,
            _ => Architecture::Other,
        };
        PlatformReport {
            operating_system: OperatingSystem::Windows,
            architecture,
        }
    }

    fn processor_count() -> ProbeValue<u64> {
        let value = unsafe { GetActiveProcessorCount(ALL_PROCESSOR_GROUPS) };
        if value == 0 {
            ProbeValue::Malformed
        } else {
            ProbeValue::Known(u64::from(value))
        }
    }

    fn memory() -> ProbeValue<NativeMemory> {
        let mut memory = MEMORYSTATUSEX {
            dwLength: size_of::<MEMORYSTATUSEX>() as u32,
            ..Default::default()
        };
        match unsafe { GlobalMemoryStatusEx(&mut memory) } {
            Ok(()) => ProbeValue::Known(NativeMemory {
                total_bytes: memory.ullTotalPhys,
                available_bytes: memory.ullAvailPhys,
            }),
            Err(error) => classify_error(error),
        }
    }

    fn application_volume() -> ProbeValue<u64> {
        let Ok(executable) = std::env::current_exe() else {
            return ProbeValue::Unknown;
        };
        let Some(directory) = executable.parent() else {
            return ProbeValue::Unknown;
        };
        disk_free_bytes(directory)
    }

    fn disk_free_bytes(directory: &Path) -> ProbeValue<u64> {
        let mut wide: Vec<u16> = directory.as_os_str().encode_wide().collect();
        wide.push(0);
        let mut available = 0_u64;
        match unsafe {
            GetDiskFreeSpaceExW(
                windows::core::PCWSTR(wide.as_ptr()),
                Some(&mut available),
                None,
                None,
            )
        } {
            Ok(()) => ProbeValue::Known(available),
            Err(error) => classify_error(error),
        }
    }

    fn luid_key(luid: windows::Win32::Foundation::LUID) -> u64 {
        u64::from(luid.LowPart) | (u64::from(luid.HighPart as u32) << 32)
    }

    fn adapter_memory(
        adapter: &IDXGIAdapter1,
        device_class: DeviceClass,
        dedicated_video_memory: usize,
    ) -> Result<(Option<u64>, Option<u64>), windows::core::Error> {
        if matches!(
            device_class,
            DeviceClass::IntegratedGpu | DeviceClass::Software
        ) {
            return Ok((Some(0), Some(0)));
        }
        let Ok(adapter3) = adapter.cast::<IDXGIAdapter3>() else {
            return Ok((Some(dedicated_video_memory as u64), None));
        };
        let mut information = DXGI_QUERY_VIDEO_MEMORY_INFO::default();
        if let Err(error) = unsafe {
            adapter3.QueryVideoMemoryInfo(0, DXGI_MEMORY_SEGMENT_GROUP_LOCAL, &mut information)
        } {
            if error.code() == E_ACCESSDENIED {
                return Err(error);
            }
            return Ok((Some(dedicated_video_memory as u64), None));
        }
        if information.CurrentUsage > information.Budget {
            return Ok((Some(dedicated_video_memory as u64), None));
        }
        Ok((
            Some(dedicated_video_memory as u64),
            Some(information.Budget - information.CurrentUsage),
        ))
    }

    fn directml_data_type(
        device: &IDMLDevice,
        data_type: DML_TENSOR_DATA_TYPE,
    ) -> Result<Availability, windows::core::Error> {
        let query = DML_FEATURE_QUERY_TENSOR_DATA_TYPE_SUPPORT {
            DataType: data_type,
        };
        let mut support = DML_FEATURE_DATA_TENSOR_DATA_TYPE_SUPPORT::default();
        unsafe {
            device.CheckFeatureSupport(
                DML_FEATURE_TENSOR_DATA_TYPE_SUPPORT,
                size_of::<DML_FEATURE_QUERY_TENSOR_DATA_TYPE_SUPPORT>() as u32,
                Some((&raw const query).cast::<c_void>()),
                size_of::<DML_FEATURE_DATA_TENSOR_DATA_TYPE_SUPPORT>() as u32,
                (&raw mut support).cast::<c_void>(),
            )?;
        }
        Ok(if support.IsSupported.as_bool() {
            Availability::Available
        } else {
            Availability::Unavailable
        })
    }

    fn directml_device(
        adapter: &IDXGIAdapter1,
        luid: u64,
    ) -> Result<Option<NativeProviderDevice>, windows::core::Error> {
        let mut d3d_device: Option<ID3D12Device> = None;
        if let Err(error) =
            unsafe { D3D12CreateDevice(adapter, D3D_FEATURE_LEVEL_11_0, &mut d3d_device) }
        {
            return if error.code() == E_ACCESSDENIED {
                Err(error)
            } else {
                Ok(None)
            };
        }
        let Some(d3d_device) = d3d_device else {
            return Ok(None);
        };
        let mut dml_device: Option<IDMLDevice> = None;
        if let Err(error) =
            unsafe { DMLCreateDevice(&d3d_device, DML_CREATE_DEVICE_FLAG_NONE, &mut dml_device) }
        {
            return if error.code() == E_ACCESSDENIED {
                Err(error)
            } else {
                Ok(None)
            };
        }
        let Some(dml_device) = dml_device else {
            return Ok(None);
        };
        let precisions = PrecisionReport {
            float32: directml_data_type(&dml_device, DML_TENSOR_DATA_TYPE_FLOAT32)?,
            float16: directml_data_type(&dml_device, DML_TENSOR_DATA_TYPE_FLOAT16)?,
            bfloat16: Availability::Unavailable,
            int8: directml_data_type(&dml_device, DML_TENSOR_DATA_TYPE_INT8)?,
        };
        Ok(Some(NativeProviderDevice { luid, precisions }))
    }

    fn adapters_and_directml() -> (
        ProbeValue<Vec<NativeAdapter>>,
        ProbeValue<Vec<NativeProviderDevice>>,
    ) {
        let factory: IDXGIFactory1 = match unsafe { CreateDXGIFactory1() } {
            Ok(factory) => factory,
            Err(error) => {
                let adapters = classify_error(error.clone());
                let directml = classify_error(error);
                return (adapters, directml);
            }
        };
        let mut adapters = Vec::new();
        let mut directml_devices = Vec::new();
        for index in 0..=MAXIMUM_NATIVE_ADAPTERS {
            let adapter = match unsafe { factory.EnumAdapters1(index as u32) } {
                Ok(_adapter) if index == MAXIMUM_NATIVE_ADAPTERS => {
                    return (ProbeValue::Malformed, ProbeValue::Malformed);
                }
                Ok(adapter) => adapter,
                Err(error) if error.code() == DXGI_ERROR_NOT_FOUND => break,
                Err(error) => {
                    let adapters = classify_error(error.clone());
                    let directml = classify_error(error);
                    return (adapters, directml);
                }
            };
            let description = match unsafe { adapter.GetDesc1() } {
                Ok(description) => description,
                Err(error) => {
                    let adapters = classify_error(error.clone());
                    let directml = classify_error(error);
                    return (adapters, directml);
                }
            };
            let device_class = if description.Flags & DXGI_ADAPTER_FLAG_SOFTWARE.0 as u32 != 0 {
                DeviceClass::Software
            } else if description.DedicatedVideoMemory == 0 {
                DeviceClass::IntegratedGpu
            } else {
                DeviceClass::DiscreteGpu
            };
            let luid = luid_key(description.AdapterLuid);
            let (dedicated_memory_bytes, available_dedicated_memory_bytes) =
                match adapter_memory(&adapter, device_class, description.DedicatedVideoMemory) {
                    Ok(memory) => memory,
                    Err(_) => {
                        return (ProbeValue::PermissionDenied, ProbeValue::PermissionDenied);
                    }
                };
            adapters.push(NativeAdapter {
                luid,
                device_class,
                dedicated_memory_bytes,
                available_dedicated_memory_bytes,
            });
            match directml_device(&adapter, luid) {
                Ok(Some(device)) => directml_devices.push(device),
                Ok(None) => {}
                Err(error) if error.code() == E_ACCESSDENIED => {
                    return (ProbeValue::Known(adapters), ProbeValue::PermissionDenied);
                }
                Err(_) => return (ProbeValue::Known(adapters), ProbeValue::Unknown),
            }
        }
        let directml = if directml_devices.is_empty() {
            ProbeValue::Unavailable
        } else {
            ProbeValue::Known(directml_devices)
        };
        (ProbeValue::Known(adapters), directml)
    }

    fn cuda() -> ProbeValue<Vec<NativeProviderDevice>> {
        let library = match CudaLibrary::load() {
            Ok(library) => library,
            Err(_) => return ProbeValue::Unavailable,
        };
        let (
            Some(initialize),
            Some(device_count),
            Some(device_get),
            Some(compute_capability),
            Some(device_luid),
        ) = (unsafe {
            (
                library.procedure::<CuInit>(windows::core::s!("cuInit")),
                library.procedure::<CuDeviceGetCount>(windows::core::s!("cuDeviceGetCount")),
                library.procedure::<CuDeviceGet>(windows::core::s!("cuDeviceGet")),
                library.procedure::<CuDeviceComputeCapability>(windows::core::s!(
                    "cuDeviceComputeCapability"
                )),
                library.procedure::<CuDeviceGetLuid>(windows::core::s!("cuDeviceGetLuid")),
            )
        })
        else {
            return ProbeValue::Unknown;
        };
        if unsafe { initialize(0) } != CUDA_SUCCESS {
            return ProbeValue::Unknown;
        }
        let mut count = 0_i32;
        if unsafe { device_count(&mut count) } != CUDA_SUCCESS {
            return ProbeValue::Unknown;
        }
        if count == 0 {
            return ProbeValue::Unavailable;
        }
        if count < 0 || count as usize > MAXIMUM_NATIVE_ADAPTERS {
            return ProbeValue::Malformed;
        }
        let mut devices = Vec::with_capacity(count as usize);
        for ordinal in 0..count {
            let mut device = 0_i32;
            let mut major = 0_i32;
            let mut minor = 0_i32;
            let mut luid = [0_i8; 8];
            let mut node_mask = 0_u32;
            if unsafe { device_get(&mut device, ordinal) } != CUDA_SUCCESS
                || unsafe { compute_capability(&mut major, &mut minor, device) } != CUDA_SUCCESS
                || unsafe { device_luid(luid.as_mut_ptr(), &mut node_mask, device) } != CUDA_SUCCESS
            {
                return ProbeValue::Unknown;
            }
            if major < 2 || minor < 0 {
                return ProbeValue::Malformed;
            }
            let luid = u64::from_le_bytes(luid.map(|value| value as u8));
            let float16 = if major > 5 || (major == 5 && minor >= 3) {
                Availability::Available
            } else {
                Availability::Unavailable
            };
            let bfloat16 = if major >= 8 {
                Availability::Available
            } else {
                Availability::Unavailable
            };
            devices.push(NativeProviderDevice {
                luid,
                precisions: PrecisionReport {
                    float32: Availability::Available,
                    float16,
                    bfloat16,
                    int8: Availability::Unknown,
                },
            });
        }
        ProbeValue::Known(devices)
    }

    impl HostProbePort for WindowsHostProbe {
        fn snapshot(&self) -> NativeHostSnapshot {
            let (adapters, directml_devices) = adapters_and_directml();
            NativeHostSnapshot {
                platform_supported: true,
                platform: platform(),
                logical_processor_count: processor_count(),
                memory: memory(),
                application_volume_available_bytes: application_volume(),
                adapters,
                cuda_devices: cuda(),
                directml_devices,
            }
        }
    }
}

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
mod tests {
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

    #[test]
    fn optional_download_gate_requires_the_closed_cuda_bfloat16_facts() {
        let report = normalize_snapshot(complete_snapshot());
        assert!(optional_cuda_bf16_profile_admitted_from_report(
            report, 8, 24_576, 4_096, 7_680, 6_144,
        ));

        let mut insufficient = complete_snapshot();
        insufficient.cuda_devices = ProbeValue::Unknown;
        assert!(!optional_cuda_bf16_profile_admitted_from_report(
            normalize_snapshot(insufficient),
            8,
            24_576,
            4_096,
            7_680,
            6_144,
        ));
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
        let source = include_str!("host_profile_detection.rs");
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
            assert!(
                !source.contains(&forbidden),
                "forbidden surface: {forbidden}"
            );
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
}
