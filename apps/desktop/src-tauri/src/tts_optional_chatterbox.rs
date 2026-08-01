//! Native-owned acquisition and removal for the optional Chatterbox package.
//!
//! The renderer can request only the one reviewed profile identifier. It never
//! provides a URL, archive, hash, executable path, or installation root.

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
};

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use tauri::{AppHandle, Manager, State};
use zip::ZipArchive;

pub(crate) const PROFILE_ID: &str = "chatterbox-multilingual-v3-cuda-bf16-default-v4";
const PACKAGE_ID: &str = "voxleaf-chatterbox-v1";
const RUNTIME_MANIFEST_NAME: &str = "runtime-manifest-v1.json";
const CHATTERBOX_SOURCE: &str =
    "https://github.com/resemble-ai/chatterbox/tree/5de7a54aa4e5e2baadb0182dde554908b48b85c2";
const MODEL_CARD_SOURCE: &str =
    "https://huggingface.co/ResembleAI/chatterbox/tree/5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18";
const PERTH_SOURCE: &str =
    "https://github.com/resemble-ai/perth/tree/ce86c2b567491eef3108ed3c137bd7bf1ddda52e";
const MANIFEST_BYTES: &[u8] = include_bytes!(
    "../../../../services/tts/release/optional/chatterbox/optional-package-manifest-v1.json"
);
const COPY_BUFFER_BYTES: usize = 1024 * 1024;
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
    requirements: OptionalRequirements,
    provenance: OptionalProvenance,
    runtime: OptionalRuntime,
    withholding_reason: Option<String>,
    artifact: Option<DownloadArtifact>,
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
    minimum_total_dedicated_vram_mi_b: u64,
    minimum_available_dedicated_vram_mi_b: u64,
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
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct LockedDependency {
    path: String,
    sha256: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct DownloadArtifact {
    url: String,
    sha256: String,
    download_bytes: u64,
    installed_bytes: u64,
    temporary_bytes: u64,
    minimum_free_bytes: u64,
    cold_start_seconds: u64,
    runtime_manifest_sha256: String,
}

#[derive(Clone, Debug, Deserialize)]
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

#[derive(Clone, Debug, Deserialize)]
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
}

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
    validate_manifest(&manifest)?;
    Ok(manifest)
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
    if manifest.schema_version != 1
        || !matches!(manifest.availability.as_str(), "withheld" | "downloadable")
        || identity.profile_id != PROFILE_ID
        || identity.package_version != "1"
        || identity.engine_version != "0.1.7"
        || identity.model_id != "ResembleAI/chatterbox"
        || identity.model_revision != "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18"
        || manifest.languages.as_slice() != ["en".to_owned(), "es".to_owned()]
        || manifest.layout.root != "app-local-data/tts"
        || manifest.layout.staging != format!("staging/{PROFILE_ID}/operation")
        || manifest.layout.installed != format!("profiles/{PROFILE_ID}/1")
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
        || requirements.minimum_total_dedicated_vram_mi_b != 7_680
        || requirements.minimum_available_dedicated_vram_mi_b != 6_144
        || manifest.provenance.chatterbox_source != CHATTERBOX_SOURCE
        || manifest.provenance.model_card != MODEL_CARD_SOURCE
        || manifest.provenance.perth_source != PERTH_SOURCE
        || !validate_sha256(&runtime.adapter_sha256)
        || !validate_sha256(&runtime.service_sha256)
        || runtime.torch_version != "2.9.1+cu128"
        || runtime.dependency_lock.path
            != "services/tts/release/profiles/chatterbox/requirements.lock"
        || !validate_sha256(&runtime.dependency_lock.sha256)
    {
        return Err(OptionalProfileError::Invalid);
    }
    match (
        &manifest.availability[..],
        &manifest.artifact,
        &manifest.withholding_reason,
    ) {
        ("withheld", None, Some(reason)) if reason == "release-artifact-not-published" => Ok(()),
        ("downloadable", Some(artifact), None)
            if artifact.url.starts_with("https://")
                && !artifact.url.contains('?')
                && validate_sha256(&artifact.sha256)
                && validate_sha256(&artifact.runtime_manifest_sha256)
                && artifact.download_bytes > 0
                && artifact.installed_bytes > 0
                && artifact.temporary_bytes >= artifact.download_bytes
                && artifact.minimum_free_bytes >= artifact.temporary_bytes
                && artifact.cold_start_seconds > 0 =>
        {
            Ok(())
        }
        _ => Err(OptionalProfileError::Invalid),
    }
}

fn snapshot_from(
    manifest: &OptionalPackageManifest,
    state: OptionalProfileState,
    downloaded_bytes: u64,
    failure: Option<&'static str>,
) -> OptionalProfileSnapshot {
    let artifact = manifest.artifact.as_ref();
    OptionalProfileSnapshot {
        profile_id: PROFILE_ID,
        state,
        download_bytes: artifact.map(|value| value.download_bytes),
        downloaded_bytes,
        installed_bytes: artifact.map(|value| value.installed_bytes),
        temporary_bytes: artifact.map(|value| value.temporary_bytes),
        minimum_free_bytes: artifact.map(|value| value.minimum_free_bytes),
        cold_start_seconds: artifact.map(|value| value.cold_start_seconds),
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

fn sha256_file(path: &Path) -> Result<String, OptionalProfileError> {
    let mut file = File::open(path).map_err(|_| OptionalProfileError::VerificationFailed)?;
    let mut digest = Sha256::new();
    let mut buffer = [0_u8; COPY_BUFFER_BYTES];
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

fn profile_root(root: &Path) -> PathBuf {
    root.join("profiles").join(PROFILE_ID)
}

fn package_root(root: &Path) -> PathBuf {
    profile_root(root).join("1")
}

fn staging_root(root: &Path) -> PathBuf {
    root.join("staging").join(PROFILE_ID)
}

fn clean_staging(root: &Path) -> Result<(), OptionalProfileError> {
    let staging = staging_root(root);
    if staging.exists() {
        fs::remove_dir_all(&staging).map_err(|_| OptionalProfileError::CleanupFailed)?;
    }
    Ok(())
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
        if metadata.file_type().is_symlink() {
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
    authority: &DownloadArtifact,
) -> Result<InstalledChatterboxRuntime, OptionalProfileError> {
    let manifest_path = root.join(RUNTIME_MANIFEST_NAME);
    let manifest_bytes =
        fs::read(&manifest_path).map_err(|_| OptionalProfileError::VerificationFailed)?;
    let manifest_hash = format!("{:x}", Sha256::digest(&manifest_bytes));
    if manifest_hash != authority.runtime_manifest_sha256 {
        return Err(OptionalProfileError::VerificationFailed);
    }
    let manifest = serde_json::from_slice::<InstalledRuntimeManifest>(&manifest_bytes)
        .map_err(|_| OptionalProfileError::VerificationFailed)?;
    if manifest.schema_version != 1
        || manifest.package_id != PACKAGE_ID
        || manifest.package_version != "1"
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
    if actual != expected {
        return Err(OptionalProfileError::VerificationFailed);
    }
    for record in &manifest.files {
        let path = root.join(safe_relative_path(&record.path)?);
        let metadata =
            fs::symlink_metadata(&path).map_err(|_| OptionalProfileError::VerificationFailed)?;
        if !metadata.is_file()
            || metadata.file_type().is_symlink()
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
        let mut buffer = [0_u8; COPY_BUFFER_BYTES];
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
    artifact: &DownloadArtifact,
) -> Result<(), OptionalProfileError> {
    let destination = package_root(root);
    let parent = destination.parent().ok_or(OptionalProfileError::Invalid)?;
    fs::create_dir_all(parent).map_err(|_| OptionalProfileError::CleanupFailed)?;
    verify_runtime(staging, artifact)?;
    let backup = parent.join(".previous");
    let _ = fs::remove_dir_all(&backup);
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

fn download_archive(
    artifact: &DownloadArtifact,
    destination: &Path,
    cancelled: &AtomicBool,
    on_progress: impl Fn(u64),
) -> Result<(), OptionalProfileError> {
    let client = reqwest::blocking::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .no_proxy()
        .build()
        .map_err(|_| OptionalProfileError::DownloadFailed)?;
    let mut response = client
        .get(&artifact.url)
        .header(reqwest::header::USER_AGENT, "VoxLeaf-optional-profile/1")
        .send()
        .map_err(|_| OptionalProfileError::DownloadFailed)?;
    if !response.status().is_success() || response.content_length() != Some(artifact.download_bytes)
    {
        return Err(OptionalProfileError::DownloadFailed);
    }
    let mut output = File::create(destination).map_err(|_| OptionalProfileError::DownloadFailed)?;
    let mut buffer = [0_u8; COPY_BUFFER_BYTES];
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
            .filter(|value| *value <= artifact.download_bytes)
            .ok_or(OptionalProfileError::DownloadFailed)?;
        output
            .write_all(&buffer[..read])
            .map_err(|_| OptionalProfileError::DownloadFailed)?;
        on_progress(downloaded);
    }
    output
        .flush()
        .map_err(|_| OptionalProfileError::DownloadFailed)?;
    if downloaded != artifact.download_bytes || sha256_file(destination)? != artifact.sha256 {
        return Err(OptionalProfileError::VerificationFailed);
    }
    Ok(())
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
        clean_staging(root)?;
        if manifest.availability == "withheld" {
            return Ok(snapshot_from(
                &manifest,
                OptionalProfileState::Withheld,
                0,
                None,
            ));
        }
        let artifact = manifest
            .artifact
            .as_ref()
            .ok_or(OptionalProfileError::Invalid)?;
        match verify_runtime(&package_root(root), artifact) {
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
        let artifact = manifest
            .artifact
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
            if available_space(root)? < artifact.minimum_free_bytes {
                return Err(OptionalProfileError::InsufficientSpace);
            }
            clean_staging(root)?;
            let staging = staging_root(root).join("operation");
            fs::create_dir_all(&staging).map_err(|_| OptionalProfileError::CleanupFailed)?;
            let archive = staging.join("package.zip");
            download_archive(artifact, &archive, &cancellation, |downloaded| {
                self.set_operation(
                    OptionalProfileState::Downloading,
                    downloaded,
                    None,
                    Some(Arc::clone(&cancellation)),
                );
            })?;
            self.set_operation(
                OptionalProfileState::Verifying,
                artifact.download_bytes,
                None,
                Some(Arc::clone(&cancellation)),
            );
            if cancellation.load(Ordering::Acquire) {
                return Err(OptionalProfileError::Cancelled);
            }
            let extracted = staging.join("package");
            extract_archive(
                &archive,
                &extracted,
                artifact.installed_bytes,
                &cancellation,
            )?;
            promote(root, &extracted, artifact)?;
            clean_staging(root)?;
            Ok(())
        })();
        match result {
            Ok(()) => {
                self.clear_operation();
                Ok(snapshot_from(
                    &manifest,
                    OptionalProfileState::Installed,
                    artifact.download_bytes,
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
            clean_staging(root)?;
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
        self.set_operation(OptionalProfileState::Removing, 0, None, None);
        let package = package_root(root);
        if package.exists() {
            fs::remove_dir_all(&package).map_err(|_| OptionalProfileError::CleanupFailed)?;
        }
        clean_staging(root)?;
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
    let artifact = manifest
        .artifact
        .as_ref()
        .ok_or(OptionalProfileError::Invalid)?;
    let root = OptionalChatterboxManager::profile_root_for()?;
    match verify_runtime(&package_root(root), artifact) {
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
        sync::atomic::{AtomicU64, Ordering},
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

    fn downloadable_manifest(runtime_manifest_sha256: String) -> DownloadArtifact {
        DownloadArtifact {
            url: "https://downloads.example.invalid/voxleaf-chatterbox-v1.zip".to_owned(),
            sha256: "0".repeat(64),
            download_bytes: 10,
            installed_bytes: 1_024,
            temporary_bytes: 1_024,
            minimum_free_bytes: 2_048,
            cold_start_seconds: 31,
            runtime_manifest_sha256,
        }
    }

    fn downloadable_package_manifest() -> OptionalPackageManifest {
        let mut manifest = exact_manifest().expect("checked in manifest should be valid");
        manifest.availability = "downloadable".to_owned();
        manifest.withholding_reason = None;
        manifest.artifact = Some(downloadable_manifest("0".repeat(64)));
        manifest
    }

    fn write_runtime(root: &Path) -> DownloadArtifact {
        let files = [
            ("runtime/python.exe", b"python".as_slice()),
            (
                "runtime/Lib/site-packages/voxleaf_tts/chatterbox_service.py",
                b"service".as_slice(),
            ),
            ("models/t3_mtl23ls_v3.safetensors", b"model".as_slice()),
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
            "schemaVersion": 1,
            "packageId": PACKAGE_ID,
            "packageVersion": "1",
            "profileId": PROFILE_ID,
            "pythonPath": "runtime/python.exe",
            "sitePackagesPath": "runtime/Lib/site-packages",
            "modelRoot": "models",
            "serviceModule": "voxleaf_tts.chatterbox_service",
            "files": records,
        }))
        .expect("manifest should render");
        fs::write(root.join(RUNTIME_MANIFEST_NAME), &manifest).expect("manifest should be written");
        downloadable_manifest(format!("{:x}", Sha256::digest(&manifest)))
    }

    #[test]
    fn checked_in_authority_is_withheld_until_a_real_release_artifact_exists() {
        let manifest = exact_manifest().expect("checked in manifest should be valid");
        assert_eq!(manifest.availability, "withheld");
        assert!(manifest.artifact.is_none());
        assert_eq!(
            manifest.withholding_reason.as_deref(),
            Some("release-artifact-not-published")
        );
    }

    #[test]
    fn downloadable_manifest_rejects_non_https_and_incomplete_integrity_facts() {
        let mut manifest = downloadable_package_manifest();
        assert!(validate_manifest(&manifest).is_ok());

        manifest
            .artifact
            .as_mut()
            .expect("test artifact should exist")
            .url = "http://downloads.example.invalid/voxleaf-chatterbox-v1.zip".to_owned();
        assert_eq!(
            validate_manifest(&manifest),
            Err(OptionalProfileError::Invalid)
        );

        let mut manifest = downloadable_package_manifest();
        manifest
            .artifact
            .as_mut()
            .expect("test artifact should exist")
            .minimum_free_bytes = 1_023;
        assert_eq!(
            validate_manifest(&manifest),
            Err(OptionalProfileError::Invalid)
        );
    }

    #[test]
    fn runtime_discovery_rejects_mutated_stale_and_traversal_payloads() {
        let root = TestRoot::new();
        let artifact = write_runtime(&root.0);
        assert!(verify_runtime(&root.0, &artifact).is_ok());

        fs::write(root.0.join("models/t3_mtl23ls_v3.safetensors"), b"changed")
            .expect("mutation should succeed");
        assert_eq!(
            verify_runtime(&root.0, &artifact),
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
}
