//! Offline admission for a measured local Chatterbox candidate.

use super::*;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct BuildReceipt {
    schema_version: u8,
    package_id: String,
    package_version: String,
    distribution: Distribution,
    measurements: Measurements,
    parts: Vec<Part>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Distribution {
    published: bool,
    admitted: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Measurements {
    archive_sha256: String,
    compressed_bytes: u64,
    installed_bytes: u64,
    runtime_manifest_sha256: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Part {
    filename: String,
    sha256: String,
    size_bytes: u64,
}

const CANDIDATE_PACKAGE: &str = "voxleaf-chatterbox-v8";
const BUILD_RECEIPT: &[u8] = include_bytes!(
    "../../../../../services/tts/release/optional/chatterbox/local-build-evidence-v8.json"
);

fn local_artifact(limits: &AcquisitionLimits) -> Result<RuntimeArtifact, OptionalProfileError> {
    let receipt: BuildReceipt =
        serde_json::from_slice(BUILD_RECEIPT).map_err(|_| OptionalProfileError::Invalid)?;
    if receipt.schema_version != 1
        || receipt.package_id != CANDIDATE_PACKAGE
        || receipt.package_version != "8"
        || receipt.distribution.published
        || receipt.distribution.admitted
    {
        return Err(OptionalProfileError::Invalid);
    }
    let measurements = receipt.measurements;
    if !validate_sha256(&measurements.archive_sha256)
        || !validate_sha256(&measurements.runtime_manifest_sha256)
        || measurements.installed_bytes == 0
        || measurements.installed_bytes > limits.maximum_runtime_installed_bytes
        || receipt.parts.is_empty()
        || receipt.parts.len() > limits.maximum_runtime_parts
    {
        return Err(OptionalProfileError::Invalid);
    }
    let mut total = 0_u64;
    let mut parts = Vec::new();
    for (index, part) in receipt.parts.into_iter().enumerate() {
        if part.filename != format!("voxleaf-chatterbox-runtime-v8.zip.part-{:03}", index + 1)
            || part.size_bytes == 0
            || part.size_bytes > limits.maximum_runtime_part_bytes
            || !validate_sha256(&part.sha256)
        {
            return Err(OptionalProfileError::Invalid);
        }
        total += part.size_bytes;
        parts.push(RuntimePart {
            filename: part.filename,
            url: String::new(),
            sha256: part.sha256,
            download_bytes: part.size_bytes,
        });
    }
    if total != measurements.compressed_bytes || total > limits.maximum_runtime_archive_bytes {
        return Err(OptionalProfileError::Invalid);
    }
    Ok(RuntimeArtifact {
        archive_sha256: measurements.archive_sha256,
        installed_bytes: measurements.installed_bytes,
        parts,
        runtime_manifest_sha256: measurements.runtime_manifest_sha256,
    })
}

pub(super) fn local_authority(
    mut authority: OptionalPackageManifest,
) -> Result<OptionalPackageManifest, OptionalProfileError> {
    authority.runtime_artifact = Some(local_artifact(&authority.limits)?);
    authority.identity.package_version = "8".to_owned();
    authority.availability = "withheld".to_owned();
    authority.measurements = None;
    Ok(authority)
}

#[cfg(feature = "local-chatterbox-v8-candidate")]
fn candidate_root(root: &Path) -> PathBuf {
    root.join("cb/8")
}

#[cfg(feature = "local-chatterbox-v8-candidate")]
pub(super) fn verify_candidate(
    root: &Path,
    authority: &OptionalPackageManifest,
) -> Result<InstalledChatterboxRuntime, OptionalProfileError> {
    let app_data = root
        .parent()
        .ok_or(OptionalProfileError::VerificationFailed)?;
    let package = candidate_root(root);
    with_installed_runtime_lock(|| {
        if !verify_owned_removal_chain(app_data, &package)? {
            return Err(OptionalProfileError::VerificationFailed);
        }
        // The child creates a cache beside the package. Both the cache and
        // its ancestry must be local even when the package receipt is cached.
        verify_owned_removal_chain(app_data, &root.join("cb/cache"))?;
        verify_runtime_cached(&package, authority)
    })
}

#[cfg(feature = "local-chatterbox-v8-candidate")]
pub(super) fn candidate_snapshot(
    root: &Path,
    authority: &OptionalPackageManifest,
) -> Result<OptionalProfileSnapshot, OptionalProfileError> {
    let (state, failure) = match verify_candidate(root, authority) {
        Ok(_) => (OptionalProfileState::Installed, None),
        Err(OptionalProfileError::VerificationFailed)
            if owned_path_present(&candidate_root(root)) =>
        {
            (
                OptionalProfileState::Failed,
                Some("installed-package-invalid"),
            )
        }
        Err(OptionalProfileError::VerificationFailed) => (OptionalProfileState::Withheld, None),
        Err(error) => return Err(error),
    };
    let mut snapshot = snapshot_from(authority, state, 0, failure);
    snapshot.removal_supported = Some(false);
    if snapshot.state == OptionalProfileState::Installed {
        let model_bytes: u64 = authority
            .model_artifacts
            .iter()
            .map(|model| model.download_bytes)
            .sum();
        snapshot.installed_bytes = authority
            .runtime_artifact
            .as_ref()
            .map(|runtime| runtime.installed_bytes + model_bytes);
    }
    Ok(snapshot)
}

#[cfg(all(test, windows))]
fn env_path(name: &str) -> PathBuf {
    let path = PathBuf::from(std::env::var_os(name).expect("explicit v8 diagnostic directory"));
    assert!(path.is_absolute() && path.is_dir());
    path
}

/// Reassemble and unpack verified build parts, then invoke the shipping tree/hash verifier.
#[cfg(all(test, windows))]
pub(crate) fn admit_exact_local_v8(scratch: &Path) -> InstalledChatterboxRuntime {
    let dist = env_path("VOXLEAF_V8_DIST");
    let model_source = env_path("VOXLEAF_V8_MODELS");
    assert_eq!(
        fs::read(dist.join("local-build-evidence-v8.json")).unwrap(),
        BUILD_RECEIPT
    );
    let authority = local_authority(exact_manifest().unwrap()).unwrap();
    let artifact = authority.runtime_artifact.as_ref().unwrap();
    let cancellation = AtomicBool::new(false);
    for part in &artifact.parts {
        verify_downloaded_artifact(part, &dist.join(&part.filename), &cancellation).unwrap();
    }
    let archive = scratch.join("runtime-v8.zip");
    reassemble_runtime(
        &dist,
        artifact,
        authority.limits.maximum_runtime_archive_bytes,
        &archive,
        &cancellation,
    )
    .unwrap();
    let package = scratch.join("cb/8");
    fs::create_dir_all(&package).unwrap();
    extract_versioned_archive(
        &archive,
        &package,
        artifact.installed_bytes,
        &cancellation,
        CANDIDATE_PACKAGE,
    )
    .unwrap();
    let models = package.join("models");
    fs::create_dir(&models).unwrap();
    for model in &authority.model_artifacts {
        let source = model_source.join(&model.filename);
        let metadata = fs::symlink_metadata(&source).unwrap();
        assert!(metadata.is_file() && !is_symlink_or_reparse_point(&metadata));
        assert_eq!(metadata.len(), model.download_bytes);
        fs::copy(source, models.join(&model.filename)).unwrap();
    }
    let runtime = verify_runtime(&package, &authority).unwrap();
    assert_eq!(runtime.protocol, TtsChildProtocol::V2);
    eprintln!("native-v8: exact parts, manifest, runtime tree and six models verified");
    runtime
}
