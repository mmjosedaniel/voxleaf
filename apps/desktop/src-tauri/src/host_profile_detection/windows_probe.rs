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
    DXGI_MEMORY_SEGMENT_GROUP_LOCAL, DXGI_QUERY_VIDEO_MEMORY_INFO, IDXGIAdapter1, IDXGIAdapter3,
    IDXGIFactory1,
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
    Architecture, Availability, DeviceClass, HostProbePort, MAXIMUM_NATIVE_ADAPTERS, NativeAdapter,
    NativeHostSnapshot, NativeMemory, NativeProviderDevice, OperatingSystem, PlatformReport,
    PrecisionReport, ProbeValue,
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
        unsafe { LoadLibraryExW(w!("nvcuda.dll"), None, LOAD_LIBRARY_SEARCH_SYSTEM32).map(Self) }
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
