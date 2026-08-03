//! Native-owned acquisition and removal for the optional Chatterbox package.
//!
//! The renderer can request only the one reviewed profile identifier. It never
//! provides a URL, archive, hash, executable path, or installation root. The
//! runtime and six official model-data files are separate verified artifacts.

use std::{
    collections::HashSet,
    fs::{self, File},
    io::{Read, Write},
    path::{Component, Path, PathBuf},
    sync::OnceLock,
    sync::{
        Arc, Mutex,
        atomic::{AtomicBool, Ordering},
    },
    time::UNIX_EPOCH,
};

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use tauri::{AppHandle, Manager, State};
use zip::ZipArchive;

pub(crate) const PROFILE_ID: &str = "chatterbox-multilingual-v3-cuda-bf16-default-v4";
const PACKAGE_ID: &str = "voxleaf-chatterbox-v2";
const PACKAGE_VERSION: &str = "2";
const RUNTIME_MANIFEST_NAME: &str = "runtime-manifest-v2.json";
const GENERATED_RUNTIME_FILES: [(&str, &[u8]); 2] = [
    (
        "runtime/Lib/site-packages/voxleaf_tts/generated/__init__.py",
        include_bytes!("../../../../services/tts/src/voxleaf_tts/generated/__init__.py"),
    ),
    (
        "runtime/Lib/site-packages/voxleaf_tts/generated/protocol_schemas.py",
        include_bytes!("../../../../services/tts/src/voxleaf_tts/generated/protocol_schemas.py"),
    ),
];
const MODEL_REVISION: &str = "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18";
const MODEL_DOWNLOAD_BASE: &str = "https://huggingface.co/ResembleAI/chatterbox/resolve/5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18/";
const CHATTERBOX_SOURCE: &str =
    "https://github.com/resemble-ai/chatterbox/tree/5de7a54aa4e5e2baadb0182dde554908b48b85c2";
const MODEL_CARD_SOURCE: &str =
    "https://huggingface.co/ResembleAI/chatterbox/tree/5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18";
const PERTH_SOURCE: &str =
    "https://github.com/resemble-ai/perth/tree/ce86c2b567491eef3108ed3c137bd7bf1ddda52e";
const MANIFEST_BYTES: &[u8] = include_bytes!(
    "../../../../services/tts/release/optional/chatterbox/optional-package-manifest-v2.json"
);
#[cfg(feature = "chatterbox-acquisition-validation")]
const VALIDATION_OVERLAY_BYTES: &[u8] = include_bytes!(
    "../../../../services/tts/release/optional/chatterbox/optional-package-validation-overlay-v1.json"
);
const COPY_BUFFER_BYTES: usize = 1024 * 1024;
const MODEL_DOWNLOAD_BYTES: u64 = 3_208_951_924;
const MODEL_FILES: [(&str, u64, &str); 6] = [
    (
        "t3_mtl23ls_v3.safetensors",
        2_143_989_928,
        "5abca8321ede76f8e61f1cc0d19aea6c946b28871017ce8726f8a69203f05953",
    ),
    (
        "s3gen.pt",
        1_057_165_844,
        "9b9ff07e60b20c136e2b1b3d7563a24604e8d2c4c267888d1ee929dd0151d2a3",
    ),
    (
        "ve.pt",
        5_698_626,
        "4b16d836bc598509860f6fa068165a8bb5e9ac84f05582dfcf278a5a372879f1",
    ),
    (
        "conds.pt",
        107_374,
        "6552d70568833628ba019c6b03459e77fe71ca197d5c560cef9411bee9d87f4e",
    ),
    (
        "grapheme_mtl_merged_expanded_v1.json",
        69_989,
        "69632f47220a788a52ce2661d096453c5655e9bf25289d89a8d832c46ee07dbf",
    ),
    (
        "Cangjie5_TC.json",
        1_920_163,
        "7073fd9de919443ae88e0bd2449917a65fe54898a4413ed1edcc4b67f28bce8c",
    ),
];
static APPLICATION_DATA_ROOT: OnceLock<PathBuf> = OnceLock::new();

#[derive(Clone, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub(crate) enum OptionalProfileState {
    Absent,
    Confirming,
    Downloading,
    Verifying,
    Installed,
    Failed,
    Removing,
    Withheld,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct OptionalProfileSnapshot {
    pub profile_id: &'static str,
    pub state: OptionalProfileState,
    pub download_bytes: Option<u64>,
    pub downloaded_bytes: u64,
    pub installed_bytes: Option<u64>,
    pub temporary_bytes: Option<u64>,
    pub minimum_free_bytes: Option<u64>,
    pub cold_start_seconds: Option<u64>,
    pub minimum_logical_processors: u64,
    pub minimum_total_ram_mi_b: u64,
    pub minimum_available_ram_mi_b: u64,
    pub measured_peak_dedicated_vram_mi_b: u64,
    pub minimum_total_dedicated_vram_mi_b: u64,
    pub minimum_available_dedicated_vram_mi_b: u64,
    pub recommended_total_dedicated_vram_mi_b: u64,
    pub license_summary: &'static str,
    pub failure: Option<&'static str>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct OptionalPackageManifest {
    schema_version: u8,
    availability: String,
    identity: OptionalIdentity,
    languages: Vec<String>,
    layout: OptionalLayout,
    licences: OptionalLicences,
    limits: AcquisitionLimits,
    measurements: Option<AcquisitionMeasurements>,
    model_artifacts: Vec<ModelArtifact>,
    requirements: OptionalRequirements,
    provenance: OptionalProvenance,
    runtime: OptionalRuntime,
    withholding_reason: Option<String>,
    runtime_artifact: Option<RuntimeArtifact>,
    runtime_correction: RuntimeCorrection,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct OptionalIdentity {
    profile_id: String,
    package_version: String,
    engine_version: String,
    model_id: String,
    model_revision: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct OptionalLayout {
    root: String,
    staging: String,
    installed: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct OptionalLicences {
    chatterbox: String,
    model: String,
    default_conditioning: String,
    perth: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct OptionalRequirements {
    platform: String,
    provider: String,
    precision: String,
    minimum_logical_processors: u64,
    minimum_total_ram_mi_b: u64,
    minimum_available_ram_mi_b: u64,
    measured_peak_dedicated_vram_mi_b: u64,
    minimum_total_dedicated_vram_mi_b: u64,
    minimum_available_dedicated_vram_mi_b: u64,
    recommended_total_dedicated_vram_mi_b: u64,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct OptionalProvenance {
    chatterbox_source: String,
    model_card: String,
    perth_source: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct OptionalRuntime {
    adapter_sha256: String,
    service_sha256: String,
    torch_version: String,
    dependency_lock: LockedDependency,
    release_tag: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct LockedDependency {
    path: String,
    sha256: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct AcquisitionLimits {
    maximum_concurrency: u64,
    maximum_installed_bytes: u64,
    maximum_redirects: usize,
    maximum_runtime_archive_bytes: u64,
    maximum_runtime_installed_bytes: u64,
    maximum_runtime_part_bytes: u64,
    maximum_runtime_parts: usize,
    maximum_staging_bytes: u64,
    maximum_transfer_bytes: u64,
    maximum_user_disclosed_free_bytes: u64,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct AcquisitionMeasurements {
    cold_start_seconds: u64,
    download_bytes: u64,
    installed_bytes: u64,
    minimum_free_bytes: u64,
    temporary_bytes: u64,
}

#[cfg(feature = "chatterbox-acquisition-validation")]
#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct ValidationOverlay {
    schema_version: u8,
    purpose: String,
    availability: String,
    public_publication_allowed: bool,
    measurements: AcquisitionMeasurements,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct ModelArtifact {
    filename: String,
    url: String,
    sha256: String,
    download_bytes: u64,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RuntimePart {
    filename: String,
    url: String,
    sha256: String,
    download_bytes: u64,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RuntimeArtifact {
    archive_sha256: String,
    installed_bytes: u64,
    parts: Vec<RuntimePart>,
    runtime_manifest_sha256: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RuntimeCorrection {
    accepted_runtime_manifest_sha256: String,
    files: Vec<RuntimeCorrectionFile>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RuntimeCorrectionFile {
    path: String,
    sha256: String,
    size_bytes: u64,
}

trait DownloadIdentity {
    fn url(&self) -> &str;
    fn sha256(&self) -> &str;
    fn download_bytes(&self) -> u64;
}

impl DownloadIdentity for ModelArtifact {
    fn url(&self) -> &str {
        &self.url
    }

    fn sha256(&self) -> &str {
        &self.sha256
    }

    fn download_bytes(&self) -> u64 {
        self.download_bytes
    }
}

impl DownloadIdentity for RuntimePart {
    fn url(&self) -> &str {
        &self.url
    }

    fn sha256(&self) -> &str {
        &self.sha256
    }

    fn download_bytes(&self) -> u64 {
        self.download_bytes
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct InstalledRuntimeManifest {
    schema_version: u8,
    package_id: String,
    package_version: String,
    profile_id: String,
    python_path: String,
    site_packages_path: String,
    model_root: String,
    service_module: String,
    files: Vec<RuntimeFile>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RuntimeFile {
    path: String,
    sha256: String,
    size_bytes: u64,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub(crate) struct InstalledChatterboxRuntime {
    pub python: PathBuf,
    pub model_root: PathBuf,
    pub site_packages: PathBuf,
    pub numba_cache_root: PathBuf,
}

#[derive(Clone, Debug, Eq, PartialEq)]
struct VerifiedRuntimeReceipt {
    canonical_root: PathBuf,
    authority_key: String,
    tree_stamp: String,
    runtime: InstalledChatterboxRuntime,
}

static VERIFIED_RUNTIME_RECEIPT: OnceLock<Mutex<Option<VerifiedRuntimeReceipt>>> = OnceLock::new();
static INSTALLED_RUNTIME_LOCK: OnceLock<Mutex<()>> = OnceLock::new();

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub(crate) enum OptionalProfileError {
    Invalid,
    Unavailable,
    Busy,
    Cancelled,
    InsufficientSpace,
    IncompatibleHost,
    DownloadFailed,
    VerificationFailed,
    CleanupFailed,
}

impl OptionalProfileError {
    fn code(self) -> &'static str {
        match self {
            Self::Invalid | Self::VerificationFailed => "tts-optional-profile-invalid",
            Self::Unavailable => "tts-optional-profile-unavailable",
            Self::Busy => "tts-optional-profile-busy",
            Self::Cancelled => "tts-optional-profile-cancelled",
            Self::InsufficientSpace => "tts-optional-profile-insufficient-space",
            Self::IncompatibleHost => "tts-optional-profile-incompatible-host",
            Self::DownloadFailed => "tts-optional-profile-download-failed",
            Self::CleanupFailed => "tts-optional-profile-cleanup-failed",
        }
    }
}

fn host_is_admitted(manifest: &OptionalPackageManifest) -> bool {
    let requirements = &manifest.requirements;
    crate::host_profile_detection::optional_cuda_bf16_profile_admitted(
        requirements.minimum_logical_processors,
        requirements.minimum_total_ram_mi_b,
        requirements.minimum_available_ram_mi_b,
        requirements.minimum_total_dedicated_vram_mi_b,
        requirements.minimum_available_dedicated_vram_mi_b,
    )
}

#[derive(Default)]
struct Operation {
    state: Option<OptionalProfileState>,
    downloaded_bytes: u64,
    failure: Option<&'static str>,
    cancellation: Option<Arc<AtomicBool>>,
}

#[derive(Default)]
pub(crate) struct OptionalChatterboxManager {
    operation: Mutex<Operation>,
}

fn exact_manifest() -> Result<OptionalPackageManifest, OptionalProfileError> {
    let manifest = serde_json::from_slice::<OptionalPackageManifest>(MANIFEST_BYTES)
        .map_err(|_| OptionalProfileError::Invalid)?;
    #[cfg(feature = "chatterbox-acquisition-validation")]
    let manifest = {
        let mut validation_manifest = manifest;
        apply_validation_overlay(&mut validation_manifest)?;
        validation_manifest
    };
    validate_manifest(&manifest)?;
    Ok(manifest)
}

#[cfg(feature = "chatterbox-acquisition-validation")]
fn apply_validation_overlay(
    manifest: &mut OptionalPackageManifest,
) -> Result<(), OptionalProfileError> {
    let overlay = serde_json::from_slice::<ValidationOverlay>(VALIDATION_OVERLAY_BYTES)
        .map_err(|_| OptionalProfileError::Invalid)?;
    let measurements = &overlay.measurements;
    if overlay.schema_version != 1
        || overlay.purpose != "local-validation-only"
        || overlay.availability != "downloadable"
        || overlay.public_publication_allowed
        || measurements.cold_start_seconds != 60
        || measurements.download_bytes != 8_231_893_387
        || measurements.installed_bytes != 8_228_503_309
        || measurements.minimum_free_bytes != 20_000_000_000
        || measurements.temporary_bytes != 13_254_834_850
        || manifest.availability != "withheld"
        || manifest.measurements.is_some()
        || manifest.withholding_reason.as_deref() != Some("clean-host-validation-pending")
    {
        return Err(OptionalProfileError::Invalid);
    }
    manifest.availability = overlay.availability;
    manifest.measurements = Some(overlay.measurements);
    manifest.withholding_reason = None;
    Ok(())
}

fn validate_sha256(value: &str) -> bool {
    value.len() == 64
        && value
            .bytes()
            .all(|byte| byte.is_ascii_hexdigit() && !byte.is_ascii_uppercase())
}

fn validate_manifest(manifest: &OptionalPackageManifest) -> Result<(), OptionalProfileError> {
    let identity = &manifest.identity;
    let requirements = &manifest.requirements;
    let runtime = &manifest.runtime;
    let limits = &manifest.limits;
    if manifest.schema_version != 2
        || !matches!(manifest.availability.as_str(), "withheld" | "downloadable")
        || identity.profile_id != PROFILE_ID
        || identity.package_version != PACKAGE_VERSION
        || identity.engine_version != "0.1.7"
        || identity.model_id != "ResembleAI/chatterbox"
        || identity.model_revision != MODEL_REVISION
        || manifest.languages.as_slice() != ["en".to_owned(), "es".to_owned()]
        || manifest.layout.root != "app-local-data/tts"
        || manifest.layout.staging != format!("staging/{PROFILE_ID}/operation")
        || manifest.layout.installed != format!("cb/{PACKAGE_VERSION}")
        || ![
            &manifest.licences.chatterbox,
            &manifest.licences.model,
            &manifest.licences.default_conditioning,
            &manifest.licences.perth,
        ]
        .iter()
        .all(|licence| licence.as_str() == "MIT")
        || requirements.platform != "windows-x86_64"
        || requirements.provider != "cuda"
        || requirements.precision != "bfloat16"
        || requirements.minimum_logical_processors != 8
        || requirements.minimum_total_ram_mi_b != 24_576
        || requirements.minimum_available_ram_mi_b != 4_096
        || requirements.measured_peak_dedicated_vram_mi_b != 3_644
        || requirements.minimum_total_dedicated_vram_mi_b != 5_632
        || requirements.minimum_available_dedicated_vram_mi_b != 4_668
        || requirements.recommended_total_dedicated_vram_mi_b != 7_680
        || manifest.provenance.chatterbox_source != CHATTERBOX_SOURCE
        || manifest.provenance.model_card != MODEL_CARD_SOURCE
        || manifest.provenance.perth_source != PERTH_SOURCE
        || !validate_sha256(&runtime.adapter_sha256)
        || !validate_sha256(&runtime.service_sha256)
        || runtime.torch_version != "2.9.1+cu128"
        || runtime.release_tag != "chatterbox-runtime-v2"
        || runtime.dependency_lock.path
            != "services/tts/release/profiles/chatterbox/requirements.lock"
        || !validate_sha256(&runtime.dependency_lock.sha256)
        || limits.maximum_concurrency != 1
        || limits.maximum_redirects != 2
        || limits.maximum_runtime_part_bytes != 1_900_000_000
        || limits.maximum_runtime_parts != 4
        || limits.maximum_runtime_archive_bytes != 5_500_000_000
        || limits.maximum_runtime_installed_bytes != 5_500_000_000
        || limits.maximum_transfer_bytes != 9_000_000_000
        || limits.maximum_installed_bytes != 9_000_000_000
        || limits.maximum_staging_bytes != 15_000_000_000
        || limits.maximum_user_disclosed_free_bytes != 20_000_000_000
        || !validate_runtime_correction(&manifest.runtime_correction)
    {
        return Err(OptionalProfileError::Invalid);
    }
    if manifest.model_artifacts.len() != MODEL_FILES.len() {
        return Err(OptionalProfileError::Invalid);
    }
    for (artifact, (filename, bytes, sha256)) in manifest.model_artifacts.iter().zip(MODEL_FILES) {
        if artifact.filename != filename
            || artifact.download_bytes != bytes
            || artifact.sha256 != sha256
            || artifact.url != format!("{MODEL_DOWNLOAD_BASE}{filename}")
        {
            return Err(OptionalProfileError::Invalid);
        }
    }
    match (
        &manifest.availability[..],
        &manifest.runtime_artifact,
        &manifest.measurements,
        &manifest.withholding_reason,
    ) {
        ("withheld", None, None, Some(reason)) if reason == "runtime-artifacts-not-published" => {
            Ok(())
        }
        ("withheld", Some(runtime_artifact), None, Some(reason))
            if reason == "clean-host-validation-pending"
                && validate_runtime_artifact(runtime_artifact, limits) =>
        {
            Ok(())
        }
        ("downloadable", Some(runtime_artifact), Some(measurements), None)
            if validate_runtime_artifact(runtime_artifact, limits)
                && validate_measurements(manifest, runtime_artifact, measurements) =>
        {
            Ok(())
        }
        _ => Err(OptionalProfileError::Invalid),
    }
}

fn validate_runtime_correction(correction: &RuntimeCorrection) -> bool {
    correction.accepted_runtime_manifest_sha256
        == "cb5055580a28a0c97e50535a8317ea506081230b70e0099d8fe0194591e1c635"
        && correction.files.len() == GENERATED_RUNTIME_FILES.len()
        && correction
            .files
            .iter()
            .zip(GENERATED_RUNTIME_FILES)
            .all(|(record, (path, contents))| {
                record.path == path
                    && record.size_bytes == contents.len() as u64
                    && record.sha256 == format!("{:x}", Sha256::digest(contents))
            })
}

fn validate_runtime_artifact(artifact: &RuntimeArtifact, limits: &AcquisitionLimits) -> bool {
    if artifact.parts.is_empty()
        || artifact.parts.len() > limits.maximum_runtime_parts
        || artifact.installed_bytes == 0
        || artifact.installed_bytes > limits.maximum_runtime_installed_bytes
        || !validate_sha256(&artifact.archive_sha256)
        || !validate_sha256(&artifact.runtime_manifest_sha256)
    {
        return false;
    }
    let mut total = 0_u64;
    for (index, part) in artifact.parts.iter().enumerate() {
        let expected_filename = format!("voxleaf-chatterbox-runtime-v2.zip.part-{:03}", index + 1);
        let expected_url = format!(
            "https://github.com/mmjosedaniel/voxleaf/releases/download/chatterbox-runtime-v2/{expected_filename}"
        );
        if part.filename != expected_filename
            || part.url != expected_url
            || part.download_bytes == 0
            || part.download_bytes > limits.maximum_runtime_part_bytes
            || !validate_sha256(&part.sha256)
        {
            return false;
        }
        total = match total.checked_add(part.download_bytes) {
            Some(value) => value,
            None => return false,
        };
    }
    total <= limits.maximum_runtime_archive_bytes
}

fn validate_measurements(
    manifest: &OptionalPackageManifest,
    runtime: &RuntimeArtifact,
    measurements: &AcquisitionMeasurements,
) -> bool {
    let runtime_download = runtime
        .parts
        .iter()
        .map(|part| part.download_bytes)
        .sum::<u64>();
    measurements.download_bytes == runtime_download + MODEL_DOWNLOAD_BYTES
        && measurements.download_bytes <= manifest.limits.maximum_transfer_bytes
        && measurements.installed_bytes == runtime.installed_bytes + MODEL_DOWNLOAD_BYTES
        && measurements.installed_bytes <= manifest.limits.maximum_installed_bytes
        && measurements.temporary_bytes >= measurements.download_bytes
        && measurements.temporary_bytes <= manifest.limits.maximum_staging_bytes
        && measurements.minimum_free_bytes >= measurements.temporary_bytes
        && measurements.minimum_free_bytes <= manifest.limits.maximum_user_disclosed_free_bytes
        && measurements.cold_start_seconds > 0
}

fn snapshot_from(
    manifest: &OptionalPackageManifest,
    state: OptionalProfileState,
    downloaded_bytes: u64,
    failure: Option<&'static str>,
) -> OptionalProfileSnapshot {
    let measurements = manifest.measurements.as_ref();
    let requirements = &manifest.requirements;
    OptionalProfileSnapshot {
        profile_id: PROFILE_ID,
        state,
        download_bytes: measurements.map(|value| value.download_bytes),
        downloaded_bytes,
        installed_bytes: measurements.map(|value| value.installed_bytes),
        temporary_bytes: measurements.map(|value| value.temporary_bytes),
        minimum_free_bytes: measurements.map(|value| value.minimum_free_bytes),
        cold_start_seconds: measurements.map(|value| value.cold_start_seconds),
        minimum_logical_processors: requirements.minimum_logical_processors,
        minimum_total_ram_mi_b: requirements.minimum_total_ram_mi_b,
        minimum_available_ram_mi_b: requirements.minimum_available_ram_mi_b,
        measured_peak_dedicated_vram_mi_b: requirements.measured_peak_dedicated_vram_mi_b,
        minimum_total_dedicated_vram_mi_b: requirements.minimum_total_dedicated_vram_mi_b,
        minimum_available_dedicated_vram_mi_b: requirements.minimum_available_dedicated_vram_mi_b,
        recommended_total_dedicated_vram_mi_b: requirements.recommended_total_dedicated_vram_mi_b,
        license_summary: "Chatterbox, its reviewed model/default conditioning, and PerTh are MIT-licensed.",
        failure,
    }
}

fn safe_relative_path(value: &str) -> Result<PathBuf, OptionalProfileError> {
    if value.is_empty() || value.contains('\\') || value.contains(':') {
        return Err(OptionalProfileError::Invalid);
    }
    let path = PathBuf::from(value);
    if path.is_absolute()
        || path
            .components()
            .any(|component| !matches!(component, Component::Normal(_)))
    {
        return Err(OptionalProfileError::Invalid);
    }
    Ok(path)
}

fn copy_buffer() -> Vec<u8> {
    vec![0_u8; COPY_BUFFER_BYTES]
}

fn sha256_file(path: &Path) -> Result<String, OptionalProfileError> {
    let mut file = File::open(path).map_err(|_| OptionalProfileError::VerificationFailed)?;
    let mut digest = Sha256::new();
    let mut buffer = copy_buffer();
    loop {
        let read = file
            .read(&mut buffer)
            .map_err(|_| OptionalProfileError::VerificationFailed)?;
        if read == 0 {
            return Ok(format!("{:x}", digest.finalize()));
        }
        digest.update(&buffer[..read]);
    }
}

fn sha256_file_cancelled(
    path: &Path,
    cancelled: &AtomicBool,
) -> Result<String, OptionalProfileError> {
    let mut file = File::open(path).map_err(|_| OptionalProfileError::VerificationFailed)?;
    let mut digest = Sha256::new();
    let mut buffer = copy_buffer();
    loop {
        if cancelled.load(Ordering::Acquire) {
            return Err(OptionalProfileError::Cancelled);
        }
        let read = file
            .read(&mut buffer)
            .map_err(|_| OptionalProfileError::VerificationFailed)?;
        if read == 0 {
            return Ok(format!("{:x}", digest.finalize()));
        }
        digest.update(&buffer[..read]);
    }
}

fn profile_root(root: &Path) -> PathBuf {
    root.join("cb")
}

fn package_root(root: &Path) -> PathBuf {
    profile_root(root).join(PACKAGE_VERSION)
}

fn legacy_package_root(root: &Path) -> PathBuf {
    root.join("profiles").join(PROFILE_ID).join(PACKAGE_VERSION)
}

fn staging_root(root: &Path) -> PathBuf {
    root.join("staging").join(PROFILE_ID)
}

fn canonical_managed_root(root: &Path) -> Result<PathBuf, OptionalProfileError> {
    let metadata =
        fs::symlink_metadata(root).map_err(|_| OptionalProfileError::VerificationFailed)?;
    if is_symlink_or_reparse_point(&metadata) || !metadata.is_dir() {
        return Err(OptionalProfileError::VerificationFailed);
    }
    root.canonicalize()
        .map_err(|_| OptionalProfileError::VerificationFailed)
}

fn canonical_contained_directory(
    root: &Path,
    directory: &Path,
) -> Result<PathBuf, OptionalProfileError> {
    let canonical_root = canonical_managed_root(root)?;
    let metadata =
        fs::symlink_metadata(directory).map_err(|_| OptionalProfileError::VerificationFailed)?;
    if is_symlink_or_reparse_point(&metadata) || !metadata.is_dir() {
        return Err(OptionalProfileError::VerificationFailed);
    }
    let canonical = directory
        .canonicalize()
        .map_err(|_| OptionalProfileError::VerificationFailed)?;
    if !canonical.starts_with(canonical_root) {
        return Err(OptionalProfileError::VerificationFailed);
    }
    Ok(canonical)
}

fn remove_contained_directory(root: &Path, directory: &Path) -> Result<(), OptionalProfileError> {
    if !directory.exists() {
        return Ok(());
    }
    canonical_contained_directory(root, directory)?;
    fs::remove_dir_all(directory).map_err(|_| OptionalProfileError::CleanupFailed)
}

fn clean_staging(root: &Path) -> Result<(), OptionalProfileError> {
    let staging = staging_root(root);
    remove_contained_directory(root, &staging)
}

fn is_symlink_or_reparse_point(metadata: &fs::Metadata) -> bool {
    if metadata.file_type().is_symlink() {
        return true;
    }
    #[cfg(windows)]
    {
        use std::os::windows::fs::MetadataExt;
        const FILE_ATTRIBUTE_REPARSE_POINT: u32 = 0x0400;
        metadata.file_attributes() & FILE_ATTRIBUTE_REPARSE_POINT != 0
    }
    #[cfg(not(windows))]
    false
}

fn collect_files(
    root: &Path,
    directory: &Path,
    canonical_root: &Path,
    files: &mut HashSet<String>,
) -> Result<(), OptionalProfileError> {
    for entry in fs::read_dir(directory).map_err(|_| OptionalProfileError::VerificationFailed)? {
        let entry = entry.map_err(|_| OptionalProfileError::VerificationFailed)?;
        let path = entry.path();
        let metadata =
            fs::symlink_metadata(&path).map_err(|_| OptionalProfileError::VerificationFailed)?;
        if is_symlink_or_reparse_point(&metadata) {
            return Err(OptionalProfileError::VerificationFailed);
        }
        let canonical = path
            .canonicalize()
            .map_err(|_| OptionalProfileError::VerificationFailed)?;
        if !canonical.starts_with(canonical_root) {
            return Err(OptionalProfileError::VerificationFailed);
        }
        if metadata.is_dir() {
            collect_files(root, &path, canonical_root, files)?;
        } else if metadata.is_file() {
            let relative = path
                .strip_prefix(root)
                .map_err(|_| OptionalProfileError::VerificationFailed)?
                .to_string_lossy()
                .replace('\\', "/");
            if !files.insert(relative) {
                return Err(OptionalProfileError::VerificationFailed);
            }
        } else {
            return Err(OptionalProfileError::VerificationFailed);
        }
    }
    Ok(())
}

fn verified_runtime_receipt() -> &'static Mutex<Option<VerifiedRuntimeReceipt>> {
    VERIFIED_RUNTIME_RECEIPT.get_or_init(|| Mutex::new(None))
}

fn with_installed_runtime_lock<T>(
    operation: impl FnOnce() -> Result<T, OptionalProfileError>,
) -> Result<T, OptionalProfileError> {
    let _guard = INSTALLED_RUNTIME_LOCK
        .get_or_init(|| Mutex::new(()))
        .lock()
        .map_err(|_| OptionalProfileError::Unavailable)?;
    operation()
}

fn invalidate_verified_runtime_receipt() {
    if let Ok(mut receipt) = verified_runtime_receipt().lock() {
        *receipt = None;
    }
}

fn update_receipt_hash(hasher: &mut Sha256, value: &[u8]) {
    hasher.update((value.len() as u64).to_le_bytes());
    hasher.update(value);
}

fn runtime_authority_key(
    manifest_authority: &OptionalPackageManifest,
) -> Result<String, OptionalProfileError> {
    let runtime_authority = manifest_authority
        .runtime_artifact
        .as_ref()
        .ok_or(OptionalProfileError::VerificationFailed)?;
    let mut hasher = Sha256::new();
    for value in [
        PACKAGE_ID,
        PACKAGE_VERSION,
        PROFILE_ID,
        runtime_authority.runtime_manifest_sha256.as_str(),
    ] {
        update_receipt_hash(&mut hasher, value.as_bytes());
    }
    for artifact in &manifest_authority.model_artifacts {
        update_receipt_hash(&mut hasher, artifact.filename.as_bytes());
        update_receipt_hash(&mut hasher, artifact.sha256.as_bytes());
        update_receipt_hash(&mut hasher, &artifact.download_bytes.to_le_bytes());
    }
    Ok(format!("{:x}", hasher.finalize()))
}

fn collect_runtime_tree_stamp(
    root: &Path,
    directory: &Path,
    canonical_root: &Path,
    records: &mut Vec<(String, u64, u64, u32)>,
) -> Result<(), OptionalProfileError> {
    for entry in fs::read_dir(directory).map_err(|_| OptionalProfileError::VerificationFailed)? {
        let entry = entry.map_err(|_| OptionalProfileError::VerificationFailed)?;
        let path = entry.path();
        let metadata =
            fs::symlink_metadata(&path).map_err(|_| OptionalProfileError::VerificationFailed)?;
        if is_symlink_or_reparse_point(&metadata) {
            return Err(OptionalProfileError::VerificationFailed);
        }
        let canonical = path
            .canonicalize()
            .map_err(|_| OptionalProfileError::VerificationFailed)?;
        if !canonical.starts_with(canonical_root) {
            return Err(OptionalProfileError::VerificationFailed);
        }
        if metadata.is_dir() {
            collect_runtime_tree_stamp(root, &path, canonical_root, records)?;
        } else if metadata.is_file() {
            let relative = path
                .strip_prefix(root)
                .map_err(|_| OptionalProfileError::VerificationFailed)?
                .to_string_lossy()
                .replace('\\', "/");
            let modified = metadata
                .modified()
                .map_err(|_| OptionalProfileError::VerificationFailed)?
                .duration_since(UNIX_EPOCH)
                .map_err(|_| OptionalProfileError::VerificationFailed)?;
            records.push((
                relative,
                metadata.len(),
                modified.as_secs(),
                modified.subsec_nanos(),
            ));
        } else {
            return Err(OptionalProfileError::VerificationFailed);
        }
    }
    Ok(())
}

fn runtime_tree_stamp(root: &Path, canonical_root: &Path) -> Result<String, OptionalProfileError> {
    let mut records = Vec::new();
    collect_runtime_tree_stamp(root, root, canonical_root, &mut records)?;
    records.sort_by(|left, right| left.0.cmp(&right.0));
    let mut hasher = Sha256::new();
    for (relative, size, seconds, nanos) in records {
        update_receipt_hash(&mut hasher, relative.as_bytes());
        update_receipt_hash(&mut hasher, &size.to_le_bytes());
        update_receipt_hash(&mut hasher, &seconds.to_le_bytes());
        update_receipt_hash(&mut hasher, &nanos.to_le_bytes());
    }
    Ok(format!("{:x}", hasher.finalize()))
}

fn resolve_directory(
    root: &Path,
    value: &str,
    canonical_root: &Path,
) -> Result<PathBuf, OptionalProfileError> {
    let path = root.join(safe_relative_path(value)?);
    let canonical = path
        .canonicalize()
        .map_err(|_| OptionalProfileError::VerificationFailed)?;
    if !canonical.is_dir() || !canonical.starts_with(canonical_root) {
        return Err(OptionalProfileError::VerificationFailed);
    }
    Ok(canonical)
}

fn resolve_file(root: &Path, value: &str) -> Result<PathBuf, OptionalProfileError> {
    let path = root.join(safe_relative_path(value)?);
    if !path.is_file() {
        return Err(OptionalProfileError::VerificationFailed);
    }
    path.canonicalize()
        .map_err(|_| OptionalProfileError::VerificationFailed)
}

fn verify_runtime(
    root: &Path,
    manifest_authority: &OptionalPackageManifest,
) -> Result<InstalledChatterboxRuntime, OptionalProfileError> {
    let runtime_authority = manifest_authority
        .runtime_artifact
        .as_ref()
        .ok_or(OptionalProfileError::VerificationFailed)?;
    let manifest_path = root.join(RUNTIME_MANIFEST_NAME);
    let manifest_bytes =
        fs::read(&manifest_path).map_err(|_| OptionalProfileError::VerificationFailed)?;
    let manifest_hash = format!("{:x}", Sha256::digest(&manifest_bytes));
    if manifest_hash != runtime_authority.runtime_manifest_sha256 {
        return Err(OptionalProfileError::VerificationFailed);
    }
    let manifest = serde_json::from_slice::<InstalledRuntimeManifest>(&manifest_bytes)
        .map_err(|_| OptionalProfileError::VerificationFailed)?;
    if manifest.schema_version != 2
        || manifest.package_id != PACKAGE_ID
        || manifest.package_version != PACKAGE_VERSION
        || manifest.profile_id != PROFILE_ID
        || manifest.service_module != "voxleaf_tts.chatterbox_service"
        || manifest.files.is_empty()
    {
        return Err(OptionalProfileError::VerificationFailed);
    }
    let canonical_root = root
        .canonicalize()
        .map_err(|_| OptionalProfileError::VerificationFailed)?;
    let expected = manifest
        .files
        .iter()
        .map(|record| record.path.clone())
        .collect::<HashSet<_>>();
    if expected.len() != manifest.files.len() || expected.contains(RUNTIME_MANIFEST_NAME) {
        return Err(OptionalProfileError::VerificationFailed);
    }
    let mut actual = HashSet::new();
    collect_files(root, root, &canonical_root, &mut actual)?;
    actual.remove(RUNTIME_MANIFEST_NAME);
    for artifact in &manifest_authority.model_artifacts {
        let relative = format!("models/{}", artifact.filename);
        let model = root.join(&relative);
        let metadata =
            fs::symlink_metadata(&model).map_err(|_| OptionalProfileError::VerificationFailed)?;
        if !metadata.is_file()
            || is_symlink_or_reparse_point(&metadata)
            || metadata.len() != artifact.download_bytes
            || sha256_file(&model)? != artifact.sha256
            || !actual.remove(&relative)
        {
            return Err(OptionalProfileError::VerificationFailed);
        }
    }
    if actual != expected {
        return Err(OptionalProfileError::VerificationFailed);
    }
    for record in &manifest.files {
        let path = root.join(safe_relative_path(&record.path)?);
        let metadata =
            fs::symlink_metadata(&path).map_err(|_| OptionalProfileError::VerificationFailed)?;
        if !metadata.is_file()
            || is_symlink_or_reparse_point(&metadata)
            || metadata.len() != record.size_bytes
            || !validate_sha256(&record.sha256)
            || sha256_file(&path)? != record.sha256
        {
            return Err(OptionalProfileError::VerificationFailed);
        }
    }
    let python = resolve_file(root, &manifest.python_path)?;
    let site_packages = resolve_directory(root, &manifest.site_packages_path, &canonical_root)?;
    resolve_file(
        root,
        &format!(
            "{}/voxleaf_tts/chatterbox_service.py",
            manifest.site_packages_path
        ),
    )?;
    let model_root = resolve_directory(root, &manifest.model_root, &canonical_root)?;
    Ok(InstalledChatterboxRuntime {
        python,
        model_root,
        site_packages,
        numba_cache_root: root
            .parent()
            .ok_or(OptionalProfileError::VerificationFailed)?
            .join("cache"),
    })
}

fn verify_runtime_cached(
    root: &Path,
    manifest_authority: &OptionalPackageManifest,
) -> Result<InstalledChatterboxRuntime, OptionalProfileError> {
    let canonical_root = root
        .canonicalize()
        .map_err(|_| OptionalProfileError::VerificationFailed)?;
    let authority_key = runtime_authority_key(manifest_authority)?;
    let before = runtime_tree_stamp(root, &canonical_root)?;

    if let Ok(receipt) = verified_runtime_receipt().lock()
        && let Some(receipt) = receipt.as_ref()
        && receipt.canonical_root == canonical_root
        && receipt.authority_key == authority_key
        && receipt.tree_stamp == before
    {
        return Ok(receipt.runtime.clone());
    }

    let runtime = verify_runtime(root, manifest_authority)?;
    let after = runtime_tree_stamp(root, &canonical_root)?;
    if before != after {
        return Err(OptionalProfileError::VerificationFailed);
    }
    if let Ok(mut receipt) = verified_runtime_receipt().lock() {
        *receipt = Some(VerifiedRuntimeReceipt {
            canonical_root,
            authority_key,
            tree_stamp: after,
            runtime: runtime.clone(),
        });
    }
    Ok(runtime)
}

fn runtime_manifest_for_bytecode_cleanup(
    root: &Path,
    manifest_authority: &OptionalPackageManifest,
) -> Result<InstalledRuntimeManifest, OptionalProfileError> {
    let runtime_authority = manifest_authority
        .runtime_artifact
        .as_ref()
        .ok_or(OptionalProfileError::VerificationFailed)?;
    let bytes = fs::read(root.join(RUNTIME_MANIFEST_NAME))
        .map_err(|_| OptionalProfileError::VerificationFailed)?;
    let hash = format!("{:x}", Sha256::digest(&bytes));
    if hash != runtime_authority.runtime_manifest_sha256
        && hash
            != manifest_authority
                .runtime_correction
                .accepted_runtime_manifest_sha256
    {
        return Err(OptionalProfileError::VerificationFailed);
    }
    let manifest = serde_json::from_slice::<InstalledRuntimeManifest>(&bytes)
        .map_err(|_| OptionalProfileError::VerificationFailed)?;
    if manifest.schema_version != 2
        || manifest.package_id != PACKAGE_ID
        || manifest.package_version != PACKAGE_VERSION
        || manifest.profile_id != PROFILE_ID
        || manifest.service_module != "voxleaf_tts.chatterbox_service"
        || manifest.files.is_empty()
    {
        return Err(OptionalProfileError::VerificationFailed);
    }
    Ok(manifest)
}

fn clean_unmanifested_python_bytecode_in(
    root: &Path,
    directory: &Path,
    canonical_root: &Path,
    inside_python_cache: bool,
    expected: &HashSet<String>,
    invalidated: &mut bool,
) -> Result<(), OptionalProfileError> {
    for entry in fs::read_dir(directory).map_err(|_| OptionalProfileError::CleanupFailed)? {
        let entry = entry.map_err(|_| OptionalProfileError::CleanupFailed)?;
        let path = entry.path();
        let metadata =
            fs::symlink_metadata(&path).map_err(|_| OptionalProfileError::CleanupFailed)?;
        if is_symlink_or_reparse_point(&metadata) {
            return Err(OptionalProfileError::VerificationFailed);
        }
        let canonical = path
            .canonicalize()
            .map_err(|_| OptionalProfileError::VerificationFailed)?;
        if !canonical.starts_with(canonical_root) {
            return Err(OptionalProfileError::VerificationFailed);
        }
        if metadata.is_dir() {
            let is_python_cache = inside_python_cache
                || path.file_name().and_then(|name| name.to_str()) == Some("__pycache__");
            clean_unmanifested_python_bytecode_in(
                root,
                &path,
                canonical_root,
                is_python_cache,
                expected,
                invalidated,
            )?;
        } else if metadata.is_file() {
            let relative = path
                .strip_prefix(root)
                .map_err(|_| OptionalProfileError::VerificationFailed)?
                .to_string_lossy()
                .replace('\\', "/");
            if inside_python_cache
                && path.extension().and_then(|value| value.to_str()) == Some("pyc")
                && !expected.contains(&relative)
            {
                if !*invalidated {
                    invalidate_verified_runtime_receipt();
                    *invalidated = true;
                }
                fs::remove_file(&path).map_err(|_| OptionalProfileError::CleanupFailed)?;
            }
        } else {
            return Err(OptionalProfileError::VerificationFailed);
        }
    }
    Ok(())
}

fn remove_unmanifested_python_bytecode(
    root: &Path,
    manifest_authority: &OptionalPackageManifest,
) -> Result<(), OptionalProfileError> {
    let runtime = root.join("runtime");
    if !runtime.exists() {
        return Ok(());
    }
    let manifest = runtime_manifest_for_bytecode_cleanup(root, manifest_authority)?;
    let expected = manifest
        .files
        .iter()
        .map(|record| record.path.clone())
        .collect::<HashSet<_>>();
    if expected.len() != manifest.files.len() {
        return Err(OptionalProfileError::VerificationFailed);
    }
    let canonical_root = root
        .canonicalize()
        .map_err(|_| OptionalProfileError::VerificationFailed)?;
    let canonical_runtime = runtime
        .canonicalize()
        .map_err(|_| OptionalProfileError::VerificationFailed)?;
    if !canonical_runtime.is_dir() || !canonical_runtime.starts_with(&canonical_root) {
        return Err(OptionalProfileError::VerificationFailed);
    }
    let mut invalidated = false;
    clean_unmanifested_python_bytecode_in(
        root,
        &runtime,
        &canonical_root,
        false,
        &expected,
        &mut invalidated,
    )
}

fn remove_transient_numba_cache_files(root: &Path) -> Result<(), OptionalProfileError> {
    let cache = root.join("runtime/Lib/site-packages/librosa/core/__pycache__");
    if !cache.exists() {
        return Ok(());
    }
    let canonical_root = root
        .canonicalize()
        .map_err(|_| OptionalProfileError::VerificationFailed)?;
    let cache_metadata =
        fs::symlink_metadata(&cache).map_err(|_| OptionalProfileError::VerificationFailed)?;
    if is_symlink_or_reparse_point(&cache_metadata) || !cache_metadata.is_dir() {
        return Err(OptionalProfileError::VerificationFailed);
    }
    let canonical_cache = cache
        .canonicalize()
        .map_err(|_| OptionalProfileError::VerificationFailed)?;
    if !canonical_cache.starts_with(&canonical_root) {
        return Err(OptionalProfileError::VerificationFailed);
    }
    let mut invalidated = false;
    for entry in fs::read_dir(&cache).map_err(|_| OptionalProfileError::CleanupFailed)? {
        let entry = entry.map_err(|_| OptionalProfileError::CleanupFailed)?;
        let path = entry.path();
        let metadata =
            fs::symlink_metadata(&path).map_err(|_| OptionalProfileError::CleanupFailed)?;
        if is_symlink_or_reparse_point(&metadata) || !metadata.is_file() {
            return Err(OptionalProfileError::VerificationFailed);
        }
        let canonical = path
            .canonicalize()
            .map_err(|_| OptionalProfileError::VerificationFailed)?;
        if !canonical.starts_with(&canonical_cache) || !canonical.starts_with(&canonical_root) {
            return Err(OptionalProfileError::VerificationFailed);
        }
        if matches!(
            path.extension().and_then(|value| value.to_str()),
            Some("nbc" | "nbi")
        ) {
            if !invalidated {
                invalidate_verified_runtime_receipt();
                invalidated = true;
            }
            fs::remove_file(path).map_err(|_| OptionalProfileError::CleanupFailed)?;
        }
    }
    Ok(())
}

fn migrate_legacy_package_root(root: &Path) -> Result<(), OptionalProfileError> {
    let destination = package_root(root);
    if destination.exists() {
        return Ok(());
    }
    let legacy = legacy_package_root(root);
    if !legacy.exists() {
        return Ok(());
    }
    canonical_contained_directory(root, &legacy)?;
    let parent = destination
        .parent()
        .ok_or(OptionalProfileError::CleanupFailed)?;
    canonical_managed_root(root)?;
    if parent.exists() {
        canonical_contained_directory(root, parent)?;
    }
    fs::create_dir_all(parent).map_err(|_| OptionalProfileError::CleanupFailed)?;
    canonical_contained_directory(root, parent)?;
    invalidate_verified_runtime_receipt();
    fs::rename(&legacy, &destination).map_err(|_| OptionalProfileError::CleanupFailed)?;
    invalidate_verified_runtime_receipt();
    if let Some(profile) = legacy.parent() {
        let _ = fs::remove_dir(profile);
        if let Some(profiles) = profile.parent() {
            let _ = fs::remove_dir(profiles);
        }
    }
    Ok(())
}

fn corrected_runtime_manifest(manifest_bytes: &[u8]) -> Result<Vec<u8>, OptionalProfileError> {
    let mut value = serde_json::from_slice::<serde_json::Value>(manifest_bytes)
        .map_err(|_| OptionalProfileError::VerificationFailed)?;
    let files = value
        .get_mut("files")
        .and_then(serde_json::Value::as_array_mut)
        .ok_or(OptionalProfileError::VerificationFailed)?;
    for (relative, contents) in GENERATED_RUNTIME_FILES {
        if files
            .iter()
            .any(|record| record.get("path").and_then(serde_json::Value::as_str) == Some(relative))
        {
            return Err(OptionalProfileError::VerificationFailed);
        }
        files.push(serde_json::json!({
            "path": relative,
            "sha256": format!("{:x}", Sha256::digest(contents)),
            "sizeBytes": contents.len(),
        }));
    }
    files.sort_by(|left, right| {
        left.get("path")
            .and_then(serde_json::Value::as_str)
            .cmp(&right.get("path").and_then(serde_json::Value::as_str))
    });
    let mut corrected =
        serde_json::to_vec_pretty(&value).map_err(|_| OptionalProfileError::VerificationFailed)?;
    corrected.push(b'\n');
    Ok(corrected)
}

fn repair_runtime_modules(
    root: &Path,
    manifest_authority: &OptionalPackageManifest,
    legacy_manifest_sha256: &str,
) -> Result<(), OptionalProfileError> {
    let runtime_authority = manifest_authority
        .runtime_artifact
        .as_ref()
        .ok_or(OptionalProfileError::VerificationFailed)?;
    let manifest_path = root.join(RUNTIME_MANIFEST_NAME);
    let manifest_bytes =
        fs::read(&manifest_path).map_err(|_| OptionalProfileError::VerificationFailed)?;
    let manifest_hash = format!("{:x}", Sha256::digest(&manifest_bytes));
    if manifest_hash == runtime_authority.runtime_manifest_sha256 {
        return Ok(());
    }
    if manifest_hash != legacy_manifest_sha256 {
        return Err(OptionalProfileError::VerificationFailed);
    }

    let corrected = corrected_runtime_manifest(&manifest_bytes)?;
    if format!("{:x}", Sha256::digest(&corrected)) != runtime_authority.runtime_manifest_sha256 {
        return Err(OptionalProfileError::VerificationFailed);
    }

    invalidate_verified_runtime_receipt();
    for (relative, contents) in GENERATED_RUNTIME_FILES {
        let target = root.join(safe_relative_path(relative)?);
        if target.exists() {
            if !target.is_file()
                || sha256_file(&target)? != format!("{:x}", Sha256::digest(contents))
            {
                return Err(OptionalProfileError::VerificationFailed);
            }
            fs::remove_file(&target).map_err(|_| OptionalProfileError::CleanupFailed)?;
        }
    }
    let mut legacy_authority = manifest_authority.clone();
    legacy_authority
        .runtime_artifact
        .as_mut()
        .ok_or(OptionalProfileError::VerificationFailed)?
        .runtime_manifest_sha256 = legacy_manifest_sha256.to_owned();
    verify_runtime(root, &legacy_authority)?;

    for (relative, contents) in GENERATED_RUNTIME_FILES {
        let target = root.join(safe_relative_path(relative)?);
        fs::create_dir_all(
            target
                .parent()
                .ok_or(OptionalProfileError::VerificationFailed)?,
        )
        .map_err(|_| OptionalProfileError::CleanupFailed)?;
        fs::write(target, contents).map_err(|_| OptionalProfileError::CleanupFailed)?;
    }
    fs::write(&manifest_path, corrected).map_err(|_| OptionalProfileError::CleanupFailed)?;
    verify_runtime(root, manifest_authority)?;
    Ok(())
}

fn repair_legacy_runtime_modules(
    root: &Path,
    manifest_authority: &OptionalPackageManifest,
) -> Result<(), OptionalProfileError> {
    repair_runtime_modules(
        root,
        manifest_authority,
        &manifest_authority
            .runtime_correction
            .accepted_runtime_manifest_sha256,
    )
}

fn prepare_installed_runtime(
    root: &Path,
    manifest_authority: &OptionalPackageManifest,
) -> Result<(), OptionalProfileError> {
    migrate_legacy_package_root(root)?;
    let package = package_root(root);
    if package.exists() {
        canonical_contained_directory(root, &package)?;
        remove_transient_numba_cache_files(&package)?;
        remove_unmanifested_python_bytecode(&package, manifest_authority)?;
        repair_legacy_runtime_modules(&package, manifest_authority)?;
    }
    Ok(())
}

fn prepare_and_verify_installed_runtime(
    root: &Path,
    manifest_authority: &OptionalPackageManifest,
    clean_abandoned_staging: bool,
) -> Result<InstalledChatterboxRuntime, OptionalProfileError> {
    with_installed_runtime_lock(|| {
        if clean_abandoned_staging {
            clean_staging(root)?;
        }
        prepare_installed_runtime(root, manifest_authority)?;
        verify_runtime_cached(&package_root(root), manifest_authority)
    })
}

fn extract_archive(
    archive_path: &Path,
    target: &Path,
    maximum_bytes: u64,
    cancelled: &AtomicBool,
) -> Result<(), OptionalProfileError> {
    let file = File::open(archive_path).map_err(|_| OptionalProfileError::VerificationFailed)?;
    let mut archive =
        ZipArchive::new(file).map_err(|_| OptionalProfileError::VerificationFailed)?;
    let mut extracted = 0_u64;
    for index in 0..archive.len() {
        if cancelled.load(Ordering::Acquire) {
            return Err(OptionalProfileError::Cancelled);
        }
        let mut entry = archive
            .by_index(index)
            .map_err(|_| OptionalProfileError::VerificationFailed)?;
        if entry.is_dir() {
            continue;
        }
        if entry
            .unix_mode()
            .is_some_and(|mode| mode & 0o170000 == 0o120000)
        {
            return Err(OptionalProfileError::VerificationFailed);
        }
        let name = entry.name().to_owned();
        let prefix = format!("{PACKAGE_ID}/");
        let relative = name
            .strip_prefix(&prefix)
            .ok_or(OptionalProfileError::VerificationFailed)?;
        let relative = safe_relative_path(relative)?;
        let declared = entry.size();
        extracted = extracted
            .checked_add(declared)
            .filter(|value| *value <= maximum_bytes)
            .ok_or(OptionalProfileError::VerificationFailed)?;
        let destination = target.join(relative);
        destination
            .parent()
            .ok_or(OptionalProfileError::VerificationFailed)?
            .try_exists()
            .map_err(|_| OptionalProfileError::VerificationFailed)?;
        fs::create_dir_all(
            destination
                .parent()
                .ok_or(OptionalProfileError::VerificationFailed)?,
        )
        .map_err(|_| OptionalProfileError::VerificationFailed)?;
        let mut output =
            File::create(destination).map_err(|_| OptionalProfileError::VerificationFailed)?;
        let mut copied = 0_u64;
        let mut buffer = copy_buffer();
        loop {
            if cancelled.load(Ordering::Acquire) {
                return Err(OptionalProfileError::Cancelled);
            }
            let read = entry
                .read(&mut buffer)
                .map_err(|_| OptionalProfileError::VerificationFailed)?;
            if read == 0 {
                break;
            }
            copied = copied
                .checked_add(read as u64)
                .filter(|value| *value <= declared)
                .ok_or(OptionalProfileError::VerificationFailed)?;
            output
                .write_all(&buffer[..read])
                .map_err(|_| OptionalProfileError::VerificationFailed)?;
        }
        if copied != declared {
            return Err(OptionalProfileError::VerificationFailed);
        }
    }
    Ok(())
}

fn promote(
    root: &Path,
    staging: &Path,
    manifest: &OptionalPackageManifest,
) -> Result<(), OptionalProfileError> {
    canonical_contained_directory(root, staging)?;
    let destination = package_root(root);
    let parent = destination.parent().ok_or(OptionalProfileError::Invalid)?;
    canonical_managed_root(root)?;
    if parent.exists() {
        canonical_contained_directory(root, parent)?;
    }
    fs::create_dir_all(parent).map_err(|_| OptionalProfileError::CleanupFailed)?;
    canonical_contained_directory(root, parent)?;
    repair_legacy_runtime_modules(staging, manifest)?;
    verify_runtime(staging, manifest)?;
    let backup = parent.join(".previous");
    let _ = fs::remove_dir_all(&backup);
    invalidate_verified_runtime_receipt();
    let moved_previous = if destination.exists() {
        fs::rename(&destination, &backup).map_err(|_| OptionalProfileError::CleanupFailed)?;
        true
    } else {
        false
    };
    let promoted = fs::rename(staging, &destination);
    if promoted.is_err() {
        if moved_previous && !destination.exists() {
            let _ = fs::rename(&backup, &destination);
        }
        return Err(OptionalProfileError::CleanupFailed);
    }
    if moved_previous {
        fs::remove_dir_all(&backup).map_err(|_| OptionalProfileError::CleanupFailed)?;
    }
    invalidate_verified_runtime_receipt();
    Ok(())
}

fn available_space(root: &Path) -> Result<u64, OptionalProfileError> {
    #[cfg(windows)]
    {
        use std::os::windows::ffi::OsStrExt;
        use windows::Win32::Storage::FileSystem::GetDiskFreeSpaceExW;
        use windows::core::PCWSTR;
        let mut input = root.as_os_str().encode_wide().collect::<Vec<_>>();
        input.push(0);
        let mut available = 0_u64;
        unsafe {
            GetDiskFreeSpaceExW(PCWSTR(input.as_ptr()), Some(&mut available), None, None)
                .map_err(|_| OptionalProfileError::InsufficientSpace)?;
        }
        Ok(available)
    }
    #[cfg(not(windows))]
    {
        let _ = root;
        Err(OptionalProfileError::Unavailable)
    }
}

#[derive(Clone, Copy)]
enum DownloadSource {
    GithubRelease,
    HuggingFace,
}

fn redirect_host_allowed(source: DownloadSource, url: &reqwest::Url) -> bool {
    if url.scheme() != "https" || !url.username().is_empty() || url.password().is_some() {
        return false;
    }
    let Some(host) = url.host_str() else {
        return false;
    };
    match source {
        DownloadSource::GithubRelease => matches!(
            host,
            "github.com" | "release-assets.githubusercontent.com" | "objects.githubusercontent.com"
        ),
        DownloadSource::HuggingFace => {
            host == "huggingface.co"
                || host == "cdn-lfs.huggingface.co"
                || host.ends_with(".cdn.hf.co")
                || host.ends_with(".xethub.hf.co")
        }
    }
}

fn redirect_allowed(
    source: DownloadSource,
    url: &reqwest::Url,
    redirects: usize,
    maximum_redirects: usize,
) -> bool {
    redirects <= maximum_redirects && redirect_host_allowed(source, url) && url.fragment().is_none()
}

fn download_artifact(
    artifact: &impl DownloadIdentity,
    source: DownloadSource,
    maximum_redirects: usize,
    destination: &Path,
    cancelled: &AtomicBool,
    on_progress: impl Fn(u64),
) -> Result<(), OptionalProfileError> {
    let initial =
        reqwest::Url::parse(artifact.url()).map_err(|_| OptionalProfileError::DownloadFailed)?;
    if !redirect_allowed(source, &initial, 0, maximum_redirects) {
        return Err(OptionalProfileError::DownloadFailed);
    }
    let client = reqwest::blocking::Client::builder()
        .redirect(reqwest::redirect::Policy::custom(move |attempt| {
            if !redirect_allowed(
                source,
                attempt.url(),
                attempt.previous().len(),
                maximum_redirects,
            ) {
                attempt.error("optional-profile-redirect-rejected")
            } else {
                attempt.follow()
            }
        }))
        .no_proxy()
        .build()
        .map_err(|_| OptionalProfileError::DownloadFailed)?;
    let mut response = client
        .get(artifact.url())
        .header(reqwest::header::USER_AGENT, "VoxLeaf-optional-profile/2")
        .send()
        .map_err(|_| OptionalProfileError::DownloadFailed)?;
    if !response.status().is_success()
        || response.content_length() != Some(artifact.download_bytes())
    {
        return Err(OptionalProfileError::DownloadFailed);
    }
    let filename = destination
        .file_name()
        .and_then(|value| value.to_str())
        .ok_or(OptionalProfileError::DownloadFailed)?;
    let partial = destination.with_file_name(format!(".{filename}.partial"));
    let _ = fs::remove_file(&partial);
    let mut output = File::create(&partial).map_err(|_| OptionalProfileError::DownloadFailed)?;
    let mut buffer = copy_buffer();
    let mut downloaded = 0_u64;
    loop {
        if cancelled.load(Ordering::Acquire) {
            return Err(OptionalProfileError::Cancelled);
        }
        let read = response
            .read(&mut buffer)
            .map_err(|_| OptionalProfileError::DownloadFailed)?;
        if read == 0 {
            break;
        }
        downloaded = downloaded
            .checked_add(read as u64)
            .filter(|value| *value <= artifact.download_bytes())
            .ok_or(OptionalProfileError::DownloadFailed)?;
        output
            .write_all(&buffer[..read])
            .map_err(|_| OptionalProfileError::DownloadFailed)?;
        on_progress(downloaded);
    }
    output
        .flush()
        .map_err(|_| OptionalProfileError::DownloadFailed)?;
    drop(output);
    if downloaded != artifact.download_bytes() {
        let _ = fs::remove_file(&partial);
        return Err(OptionalProfileError::VerificationFailed);
    }
    if let Err(error) = verify_downloaded_artifact(artifact, &partial, cancelled) {
        let _ = fs::remove_file(&partial);
        return Err(error);
    }
    fs::rename(&partial, destination).map_err(|_| OptionalProfileError::DownloadFailed)?;
    Ok(())
}

fn verify_downloaded_artifact(
    artifact: &impl DownloadIdentity,
    path: &Path,
    cancelled: &AtomicBool,
) -> Result<(), OptionalProfileError> {
    let metadata =
        fs::symlink_metadata(path).map_err(|_| OptionalProfileError::VerificationFailed)?;
    if !metadata.is_file()
        || is_symlink_or_reparse_point(&metadata)
        || metadata.len() != artifact.download_bytes()
        || sha256_file_cancelled(path, cancelled)? != artifact.sha256()
    {
        return Err(OptionalProfileError::VerificationFailed);
    }
    Ok(())
}

fn sufficient_space(available: u64, required: u64) -> bool {
    available >= required
}

fn reassemble_runtime(
    directory: &Path,
    artifact: &RuntimeArtifact,
    maximum_bytes: u64,
    destination: &Path,
    cancelled: &AtomicBool,
) -> Result<(), OptionalProfileError> {
    let mut output =
        File::create(destination).map_err(|_| OptionalProfileError::VerificationFailed)?;
    let mut digest = Sha256::new();
    let mut written = 0_u64;
    let mut buffer = copy_buffer();
    for part in &artifact.parts {
        if cancelled.load(Ordering::Acquire) {
            return Err(OptionalProfileError::Cancelled);
        }
        let mut input = File::open(directory.join(&part.filename))
            .map_err(|_| OptionalProfileError::VerificationFailed)?;
        loop {
            if cancelled.load(Ordering::Acquire) {
                return Err(OptionalProfileError::Cancelled);
            }
            let read = input
                .read(&mut buffer)
                .map_err(|_| OptionalProfileError::VerificationFailed)?;
            if read == 0 {
                break;
            }
            written = written
                .checked_add(read as u64)
                .filter(|value| *value <= maximum_bytes)
                .ok_or(OptionalProfileError::VerificationFailed)?;
            output
                .write_all(&buffer[..read])
                .map_err(|_| OptionalProfileError::VerificationFailed)?;
            digest.update(&buffer[..read]);
        }
    }
    output
        .flush()
        .map_err(|_| OptionalProfileError::VerificationFailed)?;
    if format!("{:x}", digest.finalize()) != artifact.archive_sha256 {
        return Err(OptionalProfileError::VerificationFailed);
    }
    Ok(())
}

fn discard_verified_runtime_parts(parts_root: &Path) -> Result<(), OptionalProfileError> {
    fs::remove_dir_all(parts_root).map_err(|_| OptionalProfileError::CleanupFailed)
}

impl OptionalChatterboxManager {
    fn profile_root_for() -> Result<&'static PathBuf, OptionalProfileError> {
        APPLICATION_DATA_ROOT
            .get()
            .ok_or(OptionalProfileError::Unavailable)
    }

    fn operation_snapshot(
        &self,
        manifest: &OptionalPackageManifest,
    ) -> Option<OptionalProfileSnapshot> {
        let operation = self.operation.lock().ok()?;
        operation.state.clone().map(|state| {
            snapshot_from(
                manifest,
                state,
                operation.downloaded_bytes,
                operation.failure,
            )
        })
    }

    fn set_operation(
        &self,
        state: OptionalProfileState,
        downloaded_bytes: u64,
        failure: Option<&'static str>,
        cancellation: Option<Arc<AtomicBool>>,
    ) {
        if let Ok(mut operation) = self.operation.lock() {
            *operation = Operation {
                state: Some(state),
                downloaded_bytes,
                failure,
                cancellation,
            };
        }
    }

    fn clear_operation(&self) {
        if let Ok(mut operation) = self.operation.lock() {
            *operation = Operation::default();
        }
    }

    fn snapshot_at(&self, root: &Path) -> Result<OptionalProfileSnapshot, OptionalProfileError> {
        let manifest = exact_manifest()?;
        if let Some(snapshot) = self.operation_snapshot(&manifest) {
            return Ok(snapshot);
        }
        if manifest.availability == "withheld" {
            return Ok(snapshot_from(
                &manifest,
                OptionalProfileState::Withheld,
                0,
                None,
            ));
        }
        let _runtime_artifact = manifest
            .runtime_artifact
            .as_ref()
            .ok_or(OptionalProfileError::Invalid)?;
        match prepare_and_verify_installed_runtime(root, &manifest, true) {
            Ok(_) => Ok(snapshot_from(
                &manifest,
                OptionalProfileState::Installed,
                0,
                None,
            )),
            Err(OptionalProfileError::VerificationFailed) if package_root(root).exists() => {
                Ok(snapshot_from(
                    &manifest,
                    OptionalProfileState::Failed,
                    0,
                    Some("installed-package-invalid"),
                ))
            }
            Err(OptionalProfileError::VerificationFailed) => Ok(snapshot_from(
                &manifest,
                OptionalProfileState::Absent,
                0,
                None,
            )),
            Err(error) => Err(error),
        }
    }

    fn select_at(&self, root: &Path) -> Result<OptionalProfileSnapshot, OptionalProfileError> {
        let manifest = exact_manifest()?;
        if manifest.availability == "withheld" {
            return Ok(snapshot_from(
                &manifest,
                OptionalProfileState::Withheld,
                0,
                None,
            ));
        }
        let current = self.snapshot_at(root)?;
        if current.state == OptionalProfileState::Installed {
            return Ok(current);
        }
        self.set_operation(OptionalProfileState::Confirming, 0, None, None);
        Ok(snapshot_from(
            &manifest,
            OptionalProfileState::Confirming,
            0,
            None,
        ))
    }

    fn download_at(&self, root: &Path) -> Result<OptionalProfileSnapshot, OptionalProfileError> {
        let manifest = exact_manifest()?;
        let runtime_artifact = manifest
            .runtime_artifact
            .as_ref()
            .ok_or(OptionalProfileError::Unavailable)?;
        let measurements = manifest
            .measurements
            .as_ref()
            .ok_or(OptionalProfileError::Unavailable)?;
        if manifest.availability != "downloadable" {
            return Err(OptionalProfileError::Unavailable);
        }
        let mut operation = self
            .operation
            .lock()
            .map_err(|_| OptionalProfileError::Busy)?;
        if !matches!(operation.state, Some(OptionalProfileState::Confirming)) {
            return Err(OptionalProfileError::Invalid);
        }
        let cancellation = Arc::new(AtomicBool::new(false));
        operation.state = Some(OptionalProfileState::Downloading);
        operation.downloaded_bytes = 0;
        operation.failure = None;
        operation.cancellation = Some(Arc::clone(&cancellation));
        drop(operation);

        let result = (|| {
            fs::create_dir_all(root).map_err(|_| OptionalProfileError::CleanupFailed)?;
            canonical_managed_root(root)?;
            if !sufficient_space(available_space(root)?, measurements.minimum_free_bytes) {
                return Err(OptionalProfileError::InsufficientSpace);
            }
            clean_staging(root)?;
            let staging = staging_root(root).join("operation");
            fs::create_dir_all(&staging).map_err(|_| OptionalProfileError::CleanupFailed)?;
            let downloads = staging.join("downloads");
            let runtime_downloads = downloads.join("runtime");
            let model_downloads = downloads.join("models");
            fs::create_dir_all(&runtime_downloads)
                .and_then(|_| fs::create_dir_all(&model_downloads))
                .map_err(|_| OptionalProfileError::CleanupFailed)?;
            let mut downloaded_base = 0_u64;
            for part in &runtime_artifact.parts {
                if cancellation.load(Ordering::Acquire) {
                    return Err(OptionalProfileError::Cancelled);
                }
                let base = downloaded_base;
                download_artifact(
                    part,
                    DownloadSource::GithubRelease,
                    manifest.limits.maximum_redirects,
                    &runtime_downloads.join(&part.filename),
                    &cancellation,
                    |downloaded| {
                        self.set_operation(
                            OptionalProfileState::Downloading,
                            base + downloaded,
                            None,
                            Some(Arc::clone(&cancellation)),
                        );
                    },
                )?;
                downloaded_base += part.download_bytes;
            }
            for model in &manifest.model_artifacts {
                if cancellation.load(Ordering::Acquire) {
                    return Err(OptionalProfileError::Cancelled);
                }
                let base = downloaded_base;
                download_artifact(
                    model,
                    DownloadSource::HuggingFace,
                    manifest.limits.maximum_redirects,
                    &model_downloads.join(&model.filename),
                    &cancellation,
                    |downloaded| {
                        self.set_operation(
                            OptionalProfileState::Downloading,
                            base + downloaded,
                            None,
                            Some(Arc::clone(&cancellation)),
                        );
                    },
                )?;
                downloaded_base += model.download_bytes;
            }
            self.set_operation(
                OptionalProfileState::Verifying,
                measurements.download_bytes,
                None,
                Some(Arc::clone(&cancellation)),
            );
            if cancellation.load(Ordering::Acquire) {
                return Err(OptionalProfileError::Cancelled);
            }
            let archive = staging.join("runtime.zip");
            reassemble_runtime(
                &runtime_downloads,
                runtime_artifact,
                manifest.limits.maximum_runtime_archive_bytes,
                &archive,
                &cancellation,
            )?;
            // The verified archive is now authoritative. Remove its source
            // parts before extraction so the operation stays below the frozen
            // 15 GB staging ceiling even while model files remain staged.
            discard_verified_runtime_parts(&runtime_downloads)?;
            let extracted = staging.join("package");
            extract_archive(
                &archive,
                &extracted,
                runtime_artifact.installed_bytes,
                &cancellation,
            )?;
            let models = extracted.join("models");
            fs::create_dir_all(&models).map_err(|_| OptionalProfileError::VerificationFailed)?;
            for model in &manifest.model_artifacts {
                if cancellation.load(Ordering::Acquire) {
                    return Err(OptionalProfileError::Cancelled);
                }
                fs::rename(
                    model_downloads.join(&model.filename),
                    models.join(&model.filename),
                )
                .map_err(|_| OptionalProfileError::VerificationFailed)?;
            }
            with_installed_runtime_lock(|| promote(root, &extracted, &manifest))?;
            clean_staging(root)?;
            Ok(())
        })();
        match result {
            Ok(()) => {
                self.clear_operation();
                Ok(snapshot_from(
                    &manifest,
                    OptionalProfileState::Installed,
                    measurements.download_bytes,
                    None,
                ))
            }
            Err(OptionalProfileError::Cancelled) => {
                clean_staging(root)?;
                self.clear_operation();
                Ok(snapshot_from(
                    &manifest,
                    OptionalProfileState::Absent,
                    0,
                    None,
                ))
            }
            Err(error) => {
                let _ = clean_staging(root);
                self.set_operation(OptionalProfileState::Failed, 0, Some(error.code()), None);
                Err(error)
            }
        }
    }

    fn cancel_at(&self, root: &Path) -> Result<OptionalProfileSnapshot, OptionalProfileError> {
        let manifest = exact_manifest()?;
        let state = {
            let operation = self
                .operation
                .lock()
                .map_err(|_| OptionalProfileError::Busy)?;
            let state = operation
                .state
                .clone()
                .ok_or(OptionalProfileError::Invalid)?;
            if let Some(cancellation) = &operation.cancellation {
                cancellation.store(true, Ordering::Release);
            }
            state
        };
        if state == OptionalProfileState::Confirming {
            with_installed_runtime_lock(|| clean_staging(root))?;
            self.clear_operation();
            return Ok(snapshot_from(
                &manifest,
                OptionalProfileState::Absent,
                0,
                None,
            ));
        }
        if !matches!(
            state,
            OptionalProfileState::Downloading | OptionalProfileState::Verifying
        ) {
            return Err(OptionalProfileError::Invalid);
        }
        Ok(self
            .operation_snapshot(&manifest)
            .unwrap_or_else(|| snapshot_from(&manifest, state, 0, None)))
    }

    fn remove_at(&self, root: &Path) -> Result<OptionalProfileSnapshot, OptionalProfileError> {
        let manifest = exact_manifest()?;
        if manifest.availability == "withheld" {
            return Ok(snapshot_from(
                &manifest,
                OptionalProfileState::Withheld,
                0,
                None,
            ));
        }
        {
            let operation = self
                .operation
                .lock()
                .map_err(|_| OptionalProfileError::Busy)?;
            if matches!(
                operation.state,
                Some(
                    OptionalProfileState::Confirming
                        | OptionalProfileState::Downloading
                        | OptionalProfileState::Verifying
                        | OptionalProfileState::Removing
                )
            ) {
                return Err(OptionalProfileError::Busy);
            }
        }
        self.set_operation(OptionalProfileState::Removing, 0, None, None);
        with_installed_runtime_lock(|| {
            let package = package_root(root);
            invalidate_verified_runtime_receipt();
            remove_contained_directory(root, &package)?;
            let legacy = legacy_package_root(root);
            remove_contained_directory(root, &legacy)?;
            let cache = profile_root(root).join("cache");
            remove_contained_directory(root, &cache)?;
            clean_staging(root)?;
            invalidate_verified_runtime_receipt();
            Ok(())
        })?;
        self.clear_operation();
        Ok(snapshot_from(
            &manifest,
            OptionalProfileState::Absent,
            0,
            None,
        ))
    }
}

pub(crate) fn discover_installed_chatterbox_runtime()
-> Result<Option<InstalledChatterboxRuntime>, OptionalProfileError> {
    let manifest = exact_manifest()?;
    if manifest.availability != "downloadable" {
        return Ok(None);
    }
    let root = OptionalChatterboxManager::profile_root_for()?;
    match prepare_and_verify_installed_runtime(root, &manifest, false) {
        Ok(runtime) => Ok(Some(runtime)),
        Err(OptionalProfileError::VerificationFailed) => Ok(None),
        Err(error) => Err(error),
    }
}

pub(crate) fn configure_application_data_root(app: &AppHandle) -> Result<(), OptionalProfileError> {
    let root = app
        .path()
        .app_local_data_dir()
        .map(|path| path.join("tts"))
        .map_err(|_| OptionalProfileError::Unavailable)?;
    APPLICATION_DATA_ROOT
        .set(root)
        .map_err(|_| OptionalProfileError::Unavailable)
}

#[tauri::command]
pub async fn optional_chatterbox_snapshot(
    manager: State<'_, Arc<OptionalChatterboxManager>>,
) -> Result<OptionalProfileSnapshot, &'static str> {
    let manager = Arc::clone(manager.inner());
    tauri::async_runtime::spawn_blocking(move || {
        let root = OptionalChatterboxManager::profile_root_for()?;
        manager.snapshot_at(root)
    })
    .await
    .map_err(|_| OptionalProfileError::Unavailable.code())?
    .map_err(OptionalProfileError::code)
}

#[tauri::command]
pub async fn select_optional_chatterbox(
    manager: State<'_, Arc<OptionalChatterboxManager>>,
    profile_id: String,
) -> Result<OptionalProfileSnapshot, &'static str> {
    if profile_id != PROFILE_ID {
        return Err(OptionalProfileError::Invalid.code());
    }
    let manager = Arc::clone(manager.inner());
    tauri::async_runtime::spawn_blocking(move || {
        let manifest = exact_manifest()?;
        if !host_is_admitted(&manifest) {
            return Err(OptionalProfileError::IncompatibleHost);
        }
        let root = OptionalChatterboxManager::profile_root_for()?;
        manager.select_at(root)
    })
    .await
    .map_err(|_| OptionalProfileError::Unavailable.code())?
    .map_err(OptionalProfileError::code)
}

#[tauri::command]
pub async fn download_optional_chatterbox(
    manager: State<'_, Arc<OptionalChatterboxManager>>,
    profile_id: String,
) -> Result<OptionalProfileSnapshot, &'static str> {
    if profile_id != PROFILE_ID {
        return Err(OptionalProfileError::Invalid.code());
    }
    let manager = Arc::clone(manager.inner());
    tauri::async_runtime::spawn_blocking(move || {
        let manifest = exact_manifest()?;
        if !host_is_admitted(&manifest) {
            return Err(OptionalProfileError::IncompatibleHost);
        }
        let root = OptionalChatterboxManager::profile_root_for()?;
        manager.download_at(root)
    })
    .await
    .map_err(|_| OptionalProfileError::Unavailable.code())?
    .map_err(OptionalProfileError::code)
}

#[tauri::command]
pub async fn cancel_optional_chatterbox(
    manager: State<'_, Arc<OptionalChatterboxManager>>,
    profile_id: String,
) -> Result<OptionalProfileSnapshot, &'static str> {
    if profile_id != PROFILE_ID {
        return Err(OptionalProfileError::Invalid.code());
    }
    let manager = Arc::clone(manager.inner());
    tauri::async_runtime::spawn_blocking(move || {
        let root = OptionalChatterboxManager::profile_root_for()?;
        manager.cancel_at(root)
    })
    .await
    .map_err(|_| OptionalProfileError::Unavailable.code())?
    .map_err(OptionalProfileError::code)
}

#[tauri::command]
pub async fn remove_optional_chatterbox(
    manager: State<'_, Arc<OptionalChatterboxManager>>,
    supervisor: State<'_, Arc<crate::tts_service_supervisor::TtsServiceSupervisor>>,
    profile_id: String,
) -> Result<OptionalProfileSnapshot, &'static str> {
    if profile_id != PROFILE_ID {
        return Err(OptionalProfileError::Invalid.code());
    }
    // The renderer performs identity-first player/scheduler cleanup before
    // invoking removal. Native still terminates an owned child as the final
    // containment guard before the exact package tree can be deleted.
    supervisor.force_stop();
    let manager = Arc::clone(manager.inner());
    tauri::async_runtime::spawn_blocking(move || {
        let root = OptionalChatterboxManager::profile_root_for()?;
        manager.remove_at(root)
    })
    .await
    .map_err(|_| OptionalProfileError::Unavailable.code())?
    .map_err(OptionalProfileError::code)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::{
        sync::{
            Barrier,
            atomic::{AtomicU64, Ordering},
        },
        thread,
        time::{SystemTime, UNIX_EPOCH},
    };

    static COUNTER: AtomicU64 = AtomicU64::new(1);

    struct TestRoot(PathBuf);

    impl TestRoot {
        fn new() -> Self {
            let nonce = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("clock should be available")
                .as_nanos();
            let path = std::env::temp_dir().join(format!(
                "voxleaf-optional-profile-{nonce}-{}",
                COUNTER.fetch_add(1, Ordering::Relaxed)
            ));
            fs::create_dir_all(&path).expect("test root should be created");
            Self(path)
        }
    }

    impl Drop for TestRoot {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    fn runtime_artifact(runtime_manifest_sha256: String) -> RuntimeArtifact {
        RuntimeArtifact {
            archive_sha256: "0".repeat(64),
            installed_bytes: 1_024,
            parts: vec![RuntimePart {
                filename: "voxleaf-chatterbox-runtime-v2.zip.part-001".to_owned(),
                url: "https://github.com/mmjosedaniel/voxleaf/releases/download/chatterbox-runtime-v2/voxleaf-chatterbox-runtime-v2.zip.part-001".to_owned(),
                sha256: "1".repeat(64),
                download_bytes: 10,
            }],
            runtime_manifest_sha256,
        }
    }

    fn downloadable_package_manifest() -> OptionalPackageManifest {
        let mut manifest = exact_manifest().expect("checked in manifest should be valid");
        manifest.availability = "downloadable".to_owned();
        manifest.withholding_reason = None;
        manifest.runtime_artifact = Some(runtime_artifact("0".repeat(64)));
        manifest.measurements = Some(AcquisitionMeasurements {
            cold_start_seconds: 31,
            download_bytes: MODEL_DOWNLOAD_BYTES + 10,
            installed_bytes: MODEL_DOWNLOAD_BYTES + 1_024,
            minimum_free_bytes: 7_500_000_000,
            temporary_bytes: 7_000_000_000,
        });
        manifest
    }

    fn write_runtime(root: &Path) -> OptionalPackageManifest {
        let files = [
            ("runtime/python.exe", b"python".as_slice()),
            (
                "runtime/Lib/site-packages/voxleaf_tts/chatterbox_service.py",
                b"service".as_slice(),
            ),
        ];
        let mut records = Vec::new();
        for (relative, contents) in files {
            let path = root.join(relative);
            fs::create_dir_all(path.parent().expect("parent should exist"))
                .expect("directory should be created");
            fs::write(&path, contents).expect("fixture should be written");
            records.push(serde_json::json!({
                "path": relative,
                "sha256": format!("{:x}", Sha256::digest(contents)),
                "sizeBytes": contents.len(),
            }));
        }
        let manifest = serde_json::to_vec(&serde_json::json!({
            "schemaVersion": 2,
            "packageId": PACKAGE_ID,
            "packageVersion": PACKAGE_VERSION,
            "profileId": PROFILE_ID,
            "pythonPath": "runtime/python.exe",
            "sitePackagesPath": "runtime/Lib/site-packages",
            "modelRoot": "models",
            "serviceModule": "voxleaf_tts.chatterbox_service",
            "files": records,
        }))
        .expect("manifest should render");
        fs::write(root.join(RUNTIME_MANIFEST_NAME), &manifest).expect("manifest should be written");
        let model = root.join("models/model.safetensors");
        fs::create_dir_all(model.parent().expect("model parent should exist"))
            .expect("model directory should be created");
        fs::write(&model, b"model").expect("model should be written");
        let mut authority = downloadable_package_manifest();
        authority.model_artifacts = vec![ModelArtifact {
            filename: "model.safetensors".to_owned(),
            url: "https://huggingface.co/example/model.safetensors".to_owned(),
            sha256: format!("{:x}", Sha256::digest(b"model")),
            download_bytes: 5,
        }];
        authority
            .runtime_artifact
            .as_mut()
            .expect("runtime authority should exist")
            .runtime_manifest_sha256 = format!("{:x}", Sha256::digest(&manifest));
        authority
    }

    #[cfg(not(feature = "chatterbox-acquisition-validation"))]
    #[test]
    fn checked_in_authority_records_the_release_but_remains_withheld_for_clean_host() {
        let manifest = exact_manifest().expect("checked in manifest should be valid");
        assert_eq!(manifest.availability, "withheld");
        let runtime = manifest
            .runtime_artifact
            .as_ref()
            .expect("published runtime identity should be frozen");
        assert_eq!(runtime.parts.len(), 3);
        assert_eq!(
            runtime
                .parts
                .iter()
                .map(|part| part.download_bytes)
                .sum::<u64>(),
            5_022_941_463
        );
        assert!(manifest.measurements.is_none());
        assert_eq!(manifest.model_artifacts.len(), 6);
        assert_eq!(
            manifest.withholding_reason.as_deref(),
            Some("clean-host-validation-pending")
        );
    }

    #[cfg(feature = "chatterbox-acquisition-validation")]
    #[test]
    fn validation_feature_applies_only_the_frozen_download_disclosures() {
        let manifest = exact_manifest().expect("validation manifest should be valid");
        assert_eq!(manifest.availability, "downloadable");
        assert!(manifest.withholding_reason.is_none());
        let measurements = manifest
            .measurements
            .expect("validation measurements should be present");
        assert_eq!(measurements.cold_start_seconds, 60);
        assert_eq!(measurements.download_bytes, 8_231_893_387);
        assert_eq!(measurements.installed_bytes, 8_228_503_309);
        assert_eq!(measurements.temporary_bytes, 13_254_834_850);
        assert_eq!(measurements.minimum_free_bytes, 20_000_000_000);
    }

    #[test]
    fn downloadable_manifest_rejects_non_https_and_incomplete_integrity_facts() {
        let mut manifest = downloadable_package_manifest();
        assert!(validate_manifest(&manifest).is_ok());

        manifest
            .runtime_artifact
            .as_mut()
            .expect("test artifact should exist")
            .parts[0]
            .url = "http://github.com/unsafe-runtime-part".to_owned();
        assert_eq!(
            validate_manifest(&manifest),
            Err(OptionalProfileError::Invalid)
        );

        let mut manifest = downloadable_package_manifest();
        manifest
            .measurements
            .as_mut()
            .expect("test measurements should exist")
            .minimum_free_bytes = 1_023;
        assert_eq!(
            validate_manifest(&manifest),
            Err(OptionalProfileError::Invalid)
        );
    }

    #[test]
    fn redirect_policy_rejects_source_substitution_and_non_https_targets() {
        assert!(redirect_host_allowed(
            DownloadSource::HuggingFace,
            &reqwest::Url::parse("https://us.aws.cdn.hf.co/object").expect("URL should parse"),
        ));
        assert!(redirect_host_allowed(
            DownloadSource::GithubRelease,
            &reqwest::Url::parse("https://release-assets.githubusercontent.com/object")
                .expect("URL should parse"),
        ));
        assert!(!redirect_host_allowed(
            DownloadSource::HuggingFace,
            &reqwest::Url::parse("https://example.invalid/substitution").expect("URL should parse"),
        ));
        assert!(!redirect_allowed(
            DownloadSource::HuggingFace,
            &reqwest::Url::parse("https://huggingface.co/third-redirect")
                .expect("URL should parse"),
            3,
            2,
        ));
        assert!(!redirect_host_allowed(
            DownloadSource::GithubRelease,
            &reqwest::Url::parse("http://github.com/runtime").expect("URL should parse"),
        ));
    }

    #[test]
    fn manifest_rejects_mutable_model_revision_and_unexpected_files() {
        let mut manifest = downloadable_package_manifest();
        manifest.model_artifacts[0].url =
            "https://huggingface.co/ResembleAI/chatterbox/resolve/main/t3_mtl23ls_v3.safetensors"
                .to_owned();
        assert_eq!(
            validate_manifest(&manifest),
            Err(OptionalProfileError::Invalid)
        );

        let mut manifest = downloadable_package_manifest();
        manifest
            .model_artifacts
            .push(manifest.model_artifacts[0].clone());
        assert_eq!(
            validate_manifest(&manifest),
            Err(OptionalProfileError::Invalid)
        );
    }

    #[test]
    fn downloaded_file_validation_rejects_truncation_oversize_hash_and_cancellation() {
        let root = TestRoot::new();
        let path = root.0.join("artifact.bin");
        let mut artifact = RuntimePart {
            filename: "artifact.bin".to_owned(),
            url: "https://github.com/mmjosedaniel/voxleaf/releases/download/test/artifact.bin"
                .to_owned(),
            sha256: format!("{:x}", Sha256::digest(b"data")),
            download_bytes: 4,
        };
        fs::write(&path, b"data").expect("fixture should be written");
        assert!(verify_downloaded_artifact(&artifact, &path, &AtomicBool::new(false)).is_ok());

        fs::write(&path, b"dat").expect("truncated fixture should be written");
        assert_eq!(
            verify_downloaded_artifact(&artifact, &path, &AtomicBool::new(false)),
            Err(OptionalProfileError::VerificationFailed)
        );
        fs::write(&path, b"data!").expect("oversized fixture should be written");
        assert_eq!(
            verify_downloaded_artifact(&artifact, &path, &AtomicBool::new(false)),
            Err(OptionalProfileError::VerificationFailed)
        );
        fs::write(&path, b"data").expect("fixture should be restored");
        artifact.sha256 = "f".repeat(64);
        assert_eq!(
            verify_downloaded_artifact(&artifact, &path, &AtomicBool::new(false)),
            Err(OptionalProfileError::VerificationFailed)
        );
        artifact.sha256 = format!("{:x}", Sha256::digest(b"data"));
        assert_eq!(
            verify_downloaded_artifact(&artifact, &path, &AtomicBool::new(true)),
            Err(OptionalProfileError::Cancelled)
        );
    }

    #[test]
    fn runtime_reassembly_is_ordered_bounded_and_cancellable() {
        let root = TestRoot::new();
        fs::write(root.0.join("part-1"), b"abc").expect("first part should be written");
        fs::write(root.0.join("part-2"), b"def").expect("second part should be written");
        let artifact = RuntimeArtifact {
            archive_sha256: format!("{:x}", Sha256::digest(b"abcdef")),
            installed_bytes: 1,
            parts: vec![
                RuntimePart {
                    filename: "part-1".to_owned(),
                    url: "https://github.com/part-1".to_owned(),
                    sha256: format!("{:x}", Sha256::digest(b"abc")),
                    download_bytes: 3,
                },
                RuntimePart {
                    filename: "part-2".to_owned(),
                    url: "https://github.com/part-2".to_owned(),
                    sha256: format!("{:x}", Sha256::digest(b"def")),
                    download_bytes: 3,
                },
            ],
            runtime_manifest_sha256: "0".repeat(64),
        };
        let joined = root.0.join("joined.zip");
        assert!(
            reassemble_runtime(&root.0, &artifact, 6, &joined, &AtomicBool::new(false),).is_ok()
        );
        assert_eq!(
            fs::read(&joined).expect("joined file should be readable"),
            b"abcdef"
        );
        discard_verified_runtime_parts(&root.0).expect("verified parts should be discarded");
        assert!(!root.0.exists());

        let root = TestRoot::new();
        fs::write(root.0.join("part-1"), b"abc").expect("first part should be written");
        fs::write(root.0.join("part-2"), b"def").expect("second part should be written");
        let joined = root.0.join("joined.zip");
        assert_eq!(
            reassemble_runtime(&root.0, &artifact, 5, &joined, &AtomicBool::new(false),),
            Err(OptionalProfileError::VerificationFailed)
        );
        assert_eq!(
            reassemble_runtime(&root.0, &artifact, 6, &joined, &AtomicBool::new(true),),
            Err(OptionalProfileError::Cancelled)
        );
    }

    #[test]
    fn promotion_replaces_only_the_versioned_package_after_complete_verification() {
        let root = TestRoot::new();
        let staging = root.0.join("staged-package");
        let authority = write_runtime(&staging);
        let previous = package_root(&root.0);
        fs::create_dir_all(&previous).expect("previous package should be created");
        fs::write(previous.join("stale.txt"), b"stale").expect("stale fixture should be written");

        promote(&root.0, &staging, &authority).expect("verified package should promote");

        assert!(!staging.exists());
        assert!(!previous.join("stale.txt").exists());
        assert!(previous.join("runtime/python.exe").is_file());
        assert!(!profile_root(&root.0).join(".previous").exists());
    }

    #[test]
    fn installed_legacy_runtime_moves_to_short_root_and_repairs_generated_modules() {
        let root = TestRoot::new();
        let legacy = legacy_package_root(&root.0);
        let mut authority = write_runtime(&legacy);
        let legacy_manifest = fs::read(legacy.join(RUNTIME_MANIFEST_NAME))
            .expect("legacy manifest should be readable");
        authority
            .runtime_correction
            .accepted_runtime_manifest_sha256 = format!("{:x}", Sha256::digest(&legacy_manifest));
        let corrected =
            corrected_runtime_manifest(&legacy_manifest).expect("corrected manifest should render");
        authority
            .runtime_artifact
            .as_mut()
            .expect("runtime authority should exist")
            .runtime_manifest_sha256 = format!("{:x}", Sha256::digest(&corrected));

        let transient_cache = legacy.join("runtime/Lib/site-packages/librosa/core/__pycache__");
        fs::create_dir_all(&transient_cache).expect("transient cache should be created");
        fs::write(transient_cache.join("audio.nbc"), b"cache")
            .expect("transient data should be written");
        fs::write(transient_cache.join("audio.nbi"), b"cache")
            .expect("transient index should be written");

        prepare_installed_runtime(&root.0, &authority)
            .expect("legacy package should move and repair");
        let installed = package_root(&root.0);
        assert!(installed.exists());
        assert!(!legacy.exists());
        assert!(
            installed
                .join("runtime/Lib/site-packages/transformers/models/very_long_component.py")
                .to_string_lossy()
                .len()
                < legacy
                    .join("runtime/Lib/site-packages/transformers/models/very_long_component.py")
                    .to_string_lossy()
                    .len()
        );

        assert!(
            !installed
                .join("runtime/Lib/site-packages/librosa/core/__pycache__/audio.nbc")
                .exists()
        );
        assert!(
            !installed
                .join("runtime/Lib/site-packages/librosa/core/__pycache__/audio.nbi")
                .exists()
        );
        for (relative, contents) in GENERATED_RUNTIME_FILES {
            assert_eq!(
                fs::read(installed.join(relative)).expect("generated module should exist"),
                contents
            );
        }
        assert_eq!(
            fs::read(installed.join(RUNTIME_MANIFEST_NAME))
                .expect("corrected manifest should be readable"),
            corrected
        );
        assert!(verify_runtime(&installed, &authority).is_ok());
    }

    #[test]
    fn installed_runtime_removes_only_unmanifested_python_cache_bytecode() {
        let root = TestRoot::new();
        let authority = write_runtime(&root.0);
        let python_cache = root.0.join("runtime/Lib/site-packages/example/__pycache__");
        fs::create_dir_all(&python_cache).expect("Python cache directory should be created");
        let stale_bytecode = python_cache.join("module.cpython-312.pyc");
        let unexpected_cache_file = python_cache.join("keep.txt");
        let bytecode_outside_cache = root.0.join("runtime/Lib/site-packages/example/module.pyc");
        fs::write(&stale_bytecode, b"stale bytecode").expect("bytecode fixture should be written");
        fs::write(&unexpected_cache_file, b"unexpected")
            .expect("unexpected cache fixture should be written");
        fs::write(&bytecode_outside_cache, b"unexpected")
            .expect("outside-cache fixture should be written");

        remove_unmanifested_python_bytecode(&root.0, &authority)
            .expect("safe bytecode cleanup should succeed");

        assert!(!stale_bytecode.exists());
        assert!(unexpected_cache_file.exists());
        assert!(bytecode_outside_cache.exists());
        assert_eq!(
            verify_runtime(&root.0, &authority),
            Err(OptionalProfileError::VerificationFailed)
        );
    }

    #[test]
    fn installed_runtime_verifies_after_safe_python_bytecode_cleanup() {
        let root = TestRoot::new();
        let authority = write_runtime(&root.0);
        let python_cache = root.0.join("runtime/Lib/site-packages/example/__pycache__");
        fs::create_dir_all(&python_cache).expect("Python cache directory should be created");
        fs::write(
            python_cache.join("module.cpython-312.pyc"),
            b"stale bytecode",
        )
        .expect("bytecode fixture should be written");

        remove_unmanifested_python_bytecode(&root.0, &authority)
            .expect("safe bytecode cleanup should succeed");

        assert!(verify_runtime(&root.0, &authority).is_ok());
    }

    #[test]
    fn transient_numba_cache_path_must_be_a_contained_directory() {
        let root = TestRoot::new();
        let cache = root
            .0
            .join("runtime/Lib/site-packages/librosa/core/__pycache__");
        fs::create_dir_all(cache.parent().expect("cache parent should exist"))
            .expect("cache parent should be created");
        fs::write(&cache, b"not a directory").expect("cache fixture should be written");

        assert_eq!(
            remove_transient_numba_cache_files(&root.0),
            Err(OptionalProfileError::VerificationFailed)
        );
    }

    #[cfg(unix)]
    #[test]
    fn transient_numba_cache_rejects_a_symlink_outside_the_package() {
        use std::os::unix::fs::symlink;

        let root = TestRoot::new();
        let outside = TestRoot::new();
        fs::write(outside.0.join("audio.nbc"), b"outside")
            .expect("outside cache fixture should be written");
        let cache = root
            .0
            .join("runtime/Lib/site-packages/librosa/core/__pycache__");
        fs::create_dir_all(cache.parent().expect("cache parent should exist"))
            .expect("cache parent should be created");
        symlink(&outside.0, &cache).expect("cache symlink should be created");

        assert_eq!(
            remove_transient_numba_cache_files(&root.0),
            Err(OptionalProfileError::VerificationFailed)
        );
        assert!(outside.0.join("audio.nbc").exists());
    }

    #[cfg(unix)]
    #[test]
    fn installed_package_root_rejects_a_symlink_outside_the_managed_root() {
        use std::os::unix::fs::symlink;

        let managed = TestRoot::new();
        let outside = TestRoot::new();
        let authority = write_runtime(&outside.0);
        let package = package_root(&managed.0);
        fs::create_dir_all(package.parent().expect("package parent should exist"))
            .expect("package parent should be created");
        symlink(&outside.0, &package).expect("package symlink should be created");

        assert_eq!(
            prepare_installed_runtime(&managed.0, &authority),
            Err(OptionalProfileError::VerificationFailed)
        );
        assert!(outside.0.join("runtime/python.exe").exists());
    }

    #[cfg(feature = "chatterbox-acquisition-validation")]
    #[test]
    fn removal_rejects_an_active_download_without_touching_staging() {
        let root = TestRoot::new();
        let staging = staging_root(&root.0).join("operation");
        fs::create_dir_all(&staging).expect("staging fixture should be created");
        fs::write(staging.join("partial.bin"), b"partial")
            .expect("staging fixture should be written");
        let manager = OptionalChatterboxManager::default();
        manager.set_operation(
            OptionalProfileState::Downloading,
            1,
            None,
            Some(Arc::new(AtomicBool::new(false))),
        );

        assert_eq!(manager.remove_at(&root.0), Err(OptionalProfileError::Busy));
        assert!(staging.join("partial.bin").exists());
    }

    #[test]
    fn concurrent_installed_runtime_checks_are_serialized() {
        invalidate_verified_runtime_receipt();
        let root = TestRoot::new();
        let package = package_root(&root.0);
        fs::create_dir_all(&package).expect("package root should be created");
        let authority = write_runtime(&package);
        let python_cache = package.join("runtime/Lib/site-packages/example/__pycache__");
        fs::create_dir_all(&python_cache).expect("Python cache directory should be created");
        fs::write(
            python_cache.join("module.cpython-312.pyc"),
            b"stale bytecode",
        )
        .expect("bytecode fixture should be written");
        let barrier = Arc::new(Barrier::new(3));
        let mut workers = Vec::new();
        for _ in 0..2 {
            let worker_root = root.0.clone();
            let worker_authority = authority.clone();
            let worker_barrier = Arc::clone(&barrier);
            workers.push(thread::spawn(move || {
                worker_barrier.wait();
                prepare_and_verify_installed_runtime(&worker_root, &worker_authority, false)
            }));
        }
        barrier.wait();
        for worker in workers {
            assert!(
                worker
                    .join()
                    .expect("runtime-check worker should not panic")
                    .is_ok()
            );
        }
        assert!(!python_cache.join("module.cpython-312.pyc").exists());
        assert!(verify_runtime(&package, &authority).is_ok());
        invalidate_verified_runtime_receipt();
    }

    #[test]
    fn verified_runtime_receipt_rechecks_tree_and_authority_changes() {
        invalidate_verified_runtime_receipt();
        let root = TestRoot::new();
        let authority = write_runtime(&root.0);
        let first = verify_runtime_cached(&root.0, &authority)
            .expect("first verification should create a receipt");
        assert_eq!(
            verify_runtime_cached(&root.0, &authority),
            Ok(first.clone())
        );

        fs::write(root.0.join("unexpected.txt"), b"unexpected")
            .expect("unexpected fixture should be written");
        assert_eq!(
            verify_runtime_cached(&root.0, &authority),
            Err(OptionalProfileError::VerificationFailed)
        );
        fs::remove_file(root.0.join("unexpected.txt"))
            .expect("unexpected fixture should be removed");

        let mut changed_authority = authority.clone();
        changed_authority.model_artifacts[0].sha256 = "f".repeat(64);
        assert_eq!(
            verify_runtime_cached(&root.0, &changed_authority),
            Err(OptionalProfileError::VerificationFailed)
        );

        fs::write(root.0.join("runtime/python.exe"), b"changed-python")
            .expect("runtime mutation should be written");
        assert_eq!(
            verify_runtime_cached(&root.0, &authority),
            Err(OptionalProfileError::VerificationFailed)
        );
        invalidate_verified_runtime_receipt();
    }

    #[test]
    fn free_space_gate_is_inclusive_and_result_blind() {
        assert!(sufficient_space(20, 20));
        assert!(!sufficient_space(19, 20));
    }

    #[test]
    fn runtime_discovery_rejects_mutated_stale_and_traversal_payloads() {
        let root = TestRoot::new();
        let authority = write_runtime(&root.0);
        assert!(verify_runtime(&root.0, &authority).is_ok());

        fs::write(root.0.join("models/model.safetensors"), b"changed")
            .expect("mutation should succeed");
        assert_eq!(
            verify_runtime(&root.0, &authority),
            Err(OptionalProfileError::VerificationFailed)
        );

        assert_eq!(
            safe_relative_path("../runtime/python.exe"),
            Err(OptionalProfileError::Invalid)
        );
        assert_eq!(
            safe_relative_path("C:/runtime/python.exe"),
            Err(OptionalProfileError::Invalid)
        );
    }

    #[test]
    fn safe_extraction_rejects_archive_entries_outside_the_exact_package_root() {
        let root = TestRoot::new();
        let archive_path = root.0.join("unsafe.zip");
        {
            let file = File::create(&archive_path).expect("archive should be created");
            let mut archive = zip::ZipWriter::new(file);
            archive
                .start_file("../outside.txt", zip::write::SimpleFileOptions::default())
                .expect("unsafe entry fixture should be added");
            archive
                .write_all(b"outside")
                .expect("fixture should be written");
            archive.finish().expect("archive should finish");
        }
        assert_eq!(
            extract_archive(
                &archive_path,
                &root.0.join("extract"),
                1024,
                &AtomicBool::new(false),
            ),
            Err(OptionalProfileError::VerificationFailed)
        );
    }

    #[test]
    fn extraction_observes_cancellation_before_any_payload_is_installed() {
        let root = TestRoot::new();
        let archive_path = root.0.join("package.zip");
        {
            let file = File::create(&archive_path).expect("archive should be created");
            let mut archive = zip::ZipWriter::new(file);
            archive
                .start_file(
                    format!("{PACKAGE_ID}/runtime/python.exe"),
                    zip::write::SimpleFileOptions::default(),
                )
                .expect("fixture should be added");
            archive
                .write_all(b"payload")
                .expect("fixture should be written");
            archive.finish().expect("archive should finish");
        }
        assert_eq!(
            extract_archive(
                &archive_path,
                &root.0.join("extract"),
                1024,
                &AtomicBool::new(true),
            ),
            Err(OptionalProfileError::Cancelled)
        );
        assert!(!root.0.join("extract/runtime/python.exe").exists());
    }

    #[test]
    fn hashes_optional_payloads_without_a_large_stack_allocation() {
        let root = TestRoot::new();
        let path = root.0.join("payload.bin");
        fs::write(&path, vec![7_u8; 2 * COPY_BUFFER_BYTES]).expect("fixture should be written");
        let expected = format!("{:x}", Sha256::digest(vec![7_u8; 2 * COPY_BUFFER_BYTES]));
        let actual = std::thread::Builder::new()
            .stack_size(256 * 1024)
            .spawn(move || sha256_file(&path))
            .expect("bounded-stack worker should start")
            .join()
            .expect("bounded-stack hashing should not overflow")
            .expect("fixture should hash");
        assert_eq!(actual, expected);
    }

    #[cfg(not(feature = "chatterbox-acquisition-validation"))]
    #[test]
    fn withholding_does_not_create_staging_or_change_the_existing_profile() {
        let root = TestRoot::new();
        let stale_staging = staging_root(&root.0).join("operation/package.zip");
        fs::create_dir_all(stale_staging.parent().expect("parent should exist"))
            .expect("staging fixture should be created");
        fs::write(&stale_staging, b"incomplete").expect("staging fixture should be written");
        let manager = OptionalChatterboxManager::default();
        let before = manager
            .snapshot_at(&root.0)
            .expect("snapshot should succeed");
        assert_eq!(before.state, OptionalProfileState::Withheld);
        let selected = manager
            .select_at(&root.0)
            .expect("select should be contained");
        assert_eq!(selected.state, OptionalProfileState::Withheld);
        assert!(!staging_root(&root.0).exists());
        assert!(!profile_root(&root.0).exists());
    }

    #[cfg(feature = "chatterbox-acquisition-validation")]
    #[test]
    fn validation_selection_requires_confirmation_without_creating_staging() {
        let root = TestRoot::new();
        let manager = OptionalChatterboxManager::default();
        let before = manager
            .snapshot_at(&root.0)
            .expect("snapshot should succeed");
        assert_eq!(before.state, OptionalProfileState::Absent);
        let selected = manager
            .select_at(&root.0)
            .expect("selection should reach consent");
        assert_eq!(selected.state, OptionalProfileState::Confirming);
        assert_eq!(selected.download_bytes, Some(8_231_893_387));
        assert_eq!(selected.minimum_free_bytes, Some(20_000_000_000));
        assert!(!staging_root(&root.0).exists());
        assert!(!profile_root(&root.0).exists());
    }
}
