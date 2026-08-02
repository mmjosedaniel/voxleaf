use std::{
    collections::HashSet,
    fs::{self, File},
    io::Read,
    path::{Component, Path, PathBuf},
};

use serde::Deserialize;
use sha2::{Digest, Sha256};

const PACKAGE_ID: &str = "voxleaf-piper-core-v1";
const RUNTIME_MANIFEST_NAME: &str = "runtime-manifest-v1.json";
const TRUSTED_MANIFEST: &[u8] =
    include_bytes!("../../../../services/tts/release/core/runtime-manifest-v1.json");
const PIPER_SPANISH_PROFILE_ID: &str = "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1";
const PIPER_ENGLISH_PROFILE_ID: &str = "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1";

#[derive(Clone, Debug, Eq, PartialEq)]
pub(crate) struct PackagedPiperRuntime {
    pub python: PathBuf,
    pub model_root: PathBuf,
    pub site_packages: PathBuf,
    pub runtime_voice: &'static str,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub(crate) enum PackagedCoreError {
    Invalid,
    Unavailable,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
struct RuntimeManifest {
    schema_version: u32,
    package_id: String,
    package_version: String,
    platform: String,
    core_lock_sha256: String,
    runtime: RuntimeConfiguration,
    payload_bytes: u64,
    files: Vec<FileRecord>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
struct RuntimeConfiguration {
    python_path: String,
    site_packages_path: String,
    service_module: String,
    profiles: Vec<ProfileRecord>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
struct ProfileRecord {
    language: String,
    model_root: String,
    profile_id: String,
    runtime_voice: String,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
struct FileRecord {
    path: String,
    sha256: String,
    size_bytes: u64,
}

pub(crate) fn discover_packaged_piper_runtime(
    profile_id: &str,
) -> Result<Option<PackagedPiperRuntime>, PackagedCoreError> {
    let executable = std::env::current_exe().map_err(|_| PackagedCoreError::Unavailable)?;
    let executable_root = executable.parent().ok_or(PackagedCoreError::Unavailable)?;
    let package_root = executable_root
        .join("resources")
        .join("tts")
        .join(PACKAGE_ID);
    match package_root.try_exists() {
        Ok(false) => Ok(None),
        Ok(true) => verify_package(&package_root, TRUSTED_MANIFEST, profile_id).map(Some),
        Err(_) => Err(PackagedCoreError::Unavailable),
    }
}

fn verify_package(
    package_root: &Path,
    trusted_manifest: &[u8],
    profile_id: &str,
) -> Result<PackagedPiperRuntime, PackagedCoreError> {
    let manifest_path = package_root.join(RUNTIME_MANIFEST_NAME);
    let installed_manifest = fs::read(&manifest_path).map_err(|_| PackagedCoreError::Invalid)?;
    if installed_manifest != trusted_manifest {
        return Err(PackagedCoreError::Invalid);
    }
    let manifest: RuntimeManifest =
        serde_json::from_slice(trusted_manifest).map_err(|_| PackagedCoreError::Invalid)?;
    validate_manifest_authority(&manifest)?;

    let canonical_root = package_root
        .canonicalize()
        .map_err(|_| PackagedCoreError::Invalid)?;
    let expected = manifest
        .files
        .iter()
        .map(|record| record.path.clone())
        .collect::<HashSet<_>>();
    if expected.len() != manifest.files.len() {
        return Err(PackagedCoreError::Invalid);
    }

    let mut actual = HashSet::new();
    collect_files(package_root, package_root, &canonical_root, &mut actual)?;
    actual.remove(RUNTIME_MANIFEST_NAME);
    if actual != expected {
        return Err(PackagedCoreError::Invalid);
    }

    let mut payload_bytes = 0_u64;
    for record in &manifest.files {
        let relative = safe_relative_path(&record.path)?;
        let path = package_root.join(relative);
        let metadata = fs::symlink_metadata(&path).map_err(|_| PackagedCoreError::Invalid)?;
        if !metadata.is_file() || metadata.file_type().is_symlink() {
            return Err(PackagedCoreError::Invalid);
        }
        let canonical = path
            .canonicalize()
            .map_err(|_| PackagedCoreError::Invalid)?;
        if !canonical.starts_with(&canonical_root)
            || metadata.len() != record.size_bytes
            || sha256_file(&path)? != record.sha256
        {
            return Err(PackagedCoreError::Invalid);
        }
        payload_bytes = payload_bytes
            .checked_add(record.size_bytes)
            .ok_or(PackagedCoreError::Invalid)?;
    }
    if payload_bytes != manifest.payload_bytes {
        return Err(PackagedCoreError::Invalid);
    }

    let profile = manifest
        .runtime
        .profiles
        .iter()
        .find(|profile| profile.profile_id == profile_id)
        .ok_or(PackagedCoreError::Unavailable)?;
    let runtime_voice = match profile_id {
        PIPER_SPANISH_PROFILE_ID if profile.runtime_voice == "davefx-es" => "davefx-es",
        PIPER_ENGLISH_PROFILE_ID if profile.runtime_voice == "joe-en" => "joe-en",
        _ => return Err(PackagedCoreError::Invalid),
    };
    let python = resolve_required_file(package_root, &manifest.runtime.python_path)?;
    let site_packages = resolve_required_directory(
        package_root,
        &manifest.runtime.site_packages_path,
        &canonical_root,
    )?;
    resolve_required_file(
        package_root,
        &format!(
            "{}/voxleaf_tts/piper_service.py",
            manifest.runtime.site_packages_path
        ),
    )?;
    let model_root =
        resolve_required_directory(package_root, &profile.model_root, &canonical_root)?;
    Ok(PackagedPiperRuntime {
        python,
        model_root,
        site_packages,
        runtime_voice,
    })
}

fn validate_manifest_authority(manifest: &RuntimeManifest) -> Result<(), PackagedCoreError> {
    if manifest.schema_version != 1
        || manifest.package_id != PACKAGE_ID
        || manifest.package_version != "1"
        || manifest.platform != "windows-x86_64"
        || manifest.core_lock_sha256
            != "3614294db486d1128d9e9f50ddad73f7ad166ebdd6d059a12af5b8ac66e6ce6e"
        || manifest.runtime.python_path != "runtime/python.exe"
        || manifest.runtime.site_packages_path != "runtime/Lib/site-packages"
        || manifest.runtime.service_module != "voxleaf_tts.piper_service"
        || manifest.runtime.profiles.len() != 2
    {
        return Err(PackagedCoreError::Invalid);
    }
    let profiles = manifest
        .runtime
        .profiles
        .iter()
        .map(|profile| {
            (
                profile.profile_id.as_str(),
                profile.language.as_str(),
                profile.model_root.as_str(),
                profile.runtime_voice.as_str(),
            )
        })
        .collect::<HashSet<_>>();
    let expected = HashSet::from([
        (PIPER_SPANISH_PROFILE_ID, "es", "voices/es", "davefx-es"),
        (PIPER_ENGLISH_PROFILE_ID, "en", "voices/en", "joe-en"),
    ]);
    if profiles != expected {
        return Err(PackagedCoreError::Invalid);
    }
    Ok(())
}

fn safe_relative_path(value: &str) -> Result<PathBuf, PackagedCoreError> {
    if value.is_empty() || value.contains('\\') || value.contains(':') {
        return Err(PackagedCoreError::Invalid);
    }
    let path = PathBuf::from(value);
    if path.is_absolute()
        || path
            .components()
            .any(|component| !matches!(component, Component::Normal(_)))
    {
        return Err(PackagedCoreError::Invalid);
    }
    Ok(path)
}

fn collect_files(
    root: &Path,
    directory: &Path,
    canonical_root: &Path,
    files: &mut HashSet<String>,
) -> Result<(), PackagedCoreError> {
    for entry in fs::read_dir(directory).map_err(|_| PackagedCoreError::Invalid)? {
        let entry = entry.map_err(|_| PackagedCoreError::Invalid)?;
        let path = entry.path();
        let metadata = fs::symlink_metadata(&path).map_err(|_| PackagedCoreError::Invalid)?;
        if metadata.file_type().is_symlink() {
            return Err(PackagedCoreError::Invalid);
        }
        let canonical = path
            .canonicalize()
            .map_err(|_| PackagedCoreError::Invalid)?;
        if !canonical.starts_with(canonical_root) {
            return Err(PackagedCoreError::Invalid);
        }
        if metadata.is_dir() {
            collect_files(root, &path, canonical_root, files)?;
        } else if metadata.is_file() {
            let relative = path
                .strip_prefix(root)
                .map_err(|_| PackagedCoreError::Invalid)?
                .to_string_lossy()
                .replace('\\', "/");
            if !files.insert(relative) {
                return Err(PackagedCoreError::Invalid);
            }
        } else {
            return Err(PackagedCoreError::Invalid);
        }
    }
    Ok(())
}

fn resolve_required_file(root: &Path, relative: &str) -> Result<PathBuf, PackagedCoreError> {
    let path = root.join(safe_relative_path(relative)?);
    if !path.is_file() {
        return Err(PackagedCoreError::Invalid);
    }
    path.canonicalize().map_err(|_| PackagedCoreError::Invalid)
}

fn resolve_required_directory(
    root: &Path,
    relative: &str,
    canonical_root: &Path,
) -> Result<PathBuf, PackagedCoreError> {
    let path = root.join(safe_relative_path(relative)?);
    let canonical = path
        .canonicalize()
        .map_err(|_| PackagedCoreError::Invalid)?;
    if !canonical.is_dir() || !canonical.starts_with(canonical_root) {
        return Err(PackagedCoreError::Invalid);
    }
    Ok(canonical)
}

fn sha256_file(path: &Path) -> Result<String, PackagedCoreError> {
    let mut file = File::open(path).map_err(|_| PackagedCoreError::Invalid)?;
    let mut digest = Sha256::new();
    let mut buffer = vec![0_u8; 1024 * 1024];
    loop {
        let read = file
            .read(&mut buffer)
            .map_err(|_| PackagedCoreError::Invalid)?;
        if read == 0 {
            break;
        }
        digest.update(&buffer[..read]);
    }
    Ok(format!("{:x}", digest.finalize()))
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
                .expect("time should be monotonic")
                .as_nanos();
            let path = std::env::temp_dir().join(format!(
                "voxleaf-piper-core-test-{nonce}-{}",
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

    fn write_test_package(root: &Path) -> Vec<u8> {
        let files = [
            ("runtime/python.exe", b"python".as_slice()),
            (
                "runtime/Lib/site-packages/voxleaf_tts/piper_service.py",
                b"service".as_slice(),
            ),
            ("voices/es/model.onnx", b"es".as_slice()),
            ("voices/en/model.onnx", b"en".as_slice()),
        ];
        let mut records = Vec::new();
        let mut payload_bytes = 0_u64;
        for (relative, bytes) in files {
            let path = root.join(relative);
            fs::create_dir_all(path.parent().expect("file should have a parent"))
                .expect("directory should be created");
            fs::write(path, bytes).expect("fixture should be written");
            payload_bytes += bytes.len() as u64;
            records.push(serde_json::json!({
                "path": relative,
                "sha256": format!("{:x}", Sha256::digest(bytes)),
                "sizeBytes": bytes.len(),
            }));
        }
        let manifest = serde_json::to_vec(&serde_json::json!({
            "schemaVersion": 1,
            "packageId": PACKAGE_ID,
            "packageVersion": "1",
            "platform": "windows-x86_64",
            "coreLockSha256": "3614294db486d1128d9e9f50ddad73f7ad166ebdd6d059a12af5b8ac66e6ce6e",
            "payloadBytes": payload_bytes,
            "runtime": {
                "pythonPath": "runtime/python.exe",
                "sitePackagesPath": "runtime/Lib/site-packages",
                "serviceModule": "voxleaf_tts.piper_service",
                "profiles": [
                    {"language": "es", "modelRoot": "voices/es", "profileId": PIPER_SPANISH_PROFILE_ID, "runtimeVoice": "davefx-es"},
                    {"language": "en", "modelRoot": "voices/en", "profileId": PIPER_ENGLISH_PROFILE_ID, "runtimeVoice": "joe-en"}
                ]
            },
            "files": records,
        }))
        .expect("manifest should render");
        fs::write(root.join(RUNTIME_MANIFEST_NAME), &manifest).expect("manifest should be written");
        manifest
    }

    #[test]
    fn accepts_only_the_exact_manifest_and_payload() {
        let root = TestRoot::new();
        let manifest = write_test_package(&root.0);
        let runtime = verify_package(&root.0, &manifest, PIPER_SPANISH_PROFILE_ID)
            .expect("exact package should pass");
        assert_eq!(runtime.runtime_voice, "davefx-es");
        assert!(runtime.python.ends_with("runtime/python.exe"));
    }

    #[test]
    fn rejects_truncated_substituted_and_stale_payloads() {
        for relative in ["runtime/python.exe", "voices/es/model.onnx", "stale.txt"] {
            let root = TestRoot::new();
            let manifest = write_test_package(&root.0);
            fs::write(root.0.join(relative), b"changed").expect("mutation should succeed");
            assert_eq!(
                verify_package(&root.0, &manifest, PIPER_SPANISH_PROFILE_ID),
                Err(PackagedCoreError::Invalid)
            );
        }
    }

    #[test]
    fn rejects_changed_installed_manifest_and_unknown_profile() {
        let root = TestRoot::new();
        let manifest = write_test_package(&root.0);
        fs::write(root.0.join(RUNTIME_MANIFEST_NAME), b"{}").expect("mutation should succeed");
        assert_eq!(
            verify_package(&root.0, &manifest, PIPER_SPANISH_PROFILE_ID),
            Err(PackagedCoreError::Invalid)
        );

        let root = TestRoot::new();
        let manifest = write_test_package(&root.0);
        assert_eq!(
            verify_package(&root.0, &manifest, "unknown"),
            Err(PackagedCoreError::Unavailable)
        );
    }

    #[test]
    fn rejects_unsafe_manifest_paths() {
        for path in [
            "../runtime/python.exe",
            "/runtime/python.exe",
            "C:/python.exe",
        ] {
            assert_eq!(safe_relative_path(path), Err(PackagedCoreError::Invalid));
        }
    }

    #[test]
    fn io_errors_remain_content_free() {
        assert_eq!(format!("{:?}", PackagedCoreError::Invalid), "Invalid");
    }

    #[test]
    fn hashes_the_packaged_payload_without_a_large_stack_allocation() {
        let root = TestRoot::new();
        let path = root.0.join("payload.bin");
        fs::write(&path, vec![7_u8; 2 * 1024 * 1024]).expect("fixture should be written");
        let expected = format!("{:x}", Sha256::digest(vec![7_u8; 2 * 1024 * 1024]));
        let actual = std::thread::Builder::new()
            .stack_size(256 * 1024)
            .spawn(move || sha256_file(&path))
            .expect("bounded-stack worker should start")
            .join()
            .expect("bounded-stack hashing should not overflow")
            .expect("fixture should hash");
        assert_eq!(actual, expected);
    }
}
