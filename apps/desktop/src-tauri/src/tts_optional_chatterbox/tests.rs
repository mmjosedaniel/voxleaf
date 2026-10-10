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
            filename: "voxleaf-chatterbox-runtime-v3.zip.part-001".to_owned(),
            url: "https://github.com/mmjosedaniel/voxleaf/releases/download/chatterbox-runtime-v3/voxleaf-chatterbox-runtime-v3.zip.part-001".to_owned(),
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
            "sha256": encode_sha256(Sha256::digest(contents)),
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
        sha256: encode_sha256(Sha256::digest(b"model")),
        download_bytes: 5,
    }];
    authority
        .runtime_artifact
        .as_mut()
        .expect("runtime authority should exist")
        .runtime_manifest_sha256 = encode_sha256(Sha256::digest(&manifest));
    authority
}

#[test]
fn checked_in_authority_enables_the_measured_ordinary_package() {
    let manifest: OptionalPackageManifest = serde_json::from_slice(include_bytes!(
        "../../../../../services/tts/release/optional/chatterbox/optional-package-manifest-v2.json"
    ))
    .expect("historical authority should parse");
    validate_manifest_version(&manifest, "2").expect("historical authority should validate");
    assert_eq!(manifest.availability, "downloadable");
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
    assert_eq!(manifest.model_artifacts.len(), 6);
    assert!(manifest.withholding_reason.is_none());
    let measurements = manifest
        .measurements
        .expect("ordinary measurements should be present");
    assert_eq!(measurements.cold_start_seconds, 83);
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
        &reqwest::Url::parse("https://huggingface.co/third-redirect").expect("URL should parse"),
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
        sha256: encode_sha256(Sha256::digest(b"data")),
        download_bytes: 4,
    };
    fs::write(&path, b"data").expect("fixture should be written");
    assert!(verify_downloaded_artifact(&artifact, &path, &AtomicBool::new(false)).is_ok());

    fs::write(&path, b"dAta").expect("same-size substitution should be written");
    assert_eq!(
        verify_downloaded_artifact(&artifact, &path, &AtomicBool::new(false)),
        Err(OptionalProfileError::VerificationFailed)
    );
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
    artifact.sha256 = encode_sha256(Sha256::digest(b"data"));
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
        archive_sha256: encode_sha256(Sha256::digest(b"abcdef")),
        installed_bytes: 1,
        parts: vec![
            RuntimePart {
                filename: "part-1".to_owned(),
                url: "https://github.com/part-1".to_owned(),
                sha256: encode_sha256(Sha256::digest(b"abc")),
                download_bytes: 3,
            },
            RuntimePart {
                filename: "part-2".to_owned(),
                url: "https://github.com/part-2".to_owned(),
                sha256: encode_sha256(Sha256::digest(b"def")),
                download_bytes: 3,
            },
        ],
        runtime_manifest_sha256: "0".repeat(64),
    };
    let joined = root.0.join("joined.zip");
    assert!(reassemble_runtime(&root.0, &artifact, 6, &joined, &AtomicBool::new(false),).is_ok());
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
fn installed_v3_runtime_verifies_after_transient_numba_cache_cleanup() {
    let root = TestRoot::new();
    let installed = package_root(&root.0);
    let authority = write_runtime(&installed);

    let transient_cache = installed.join("runtime/Lib/site-packages/librosa/core/__pycache__");
    fs::create_dir_all(&transient_cache).expect("transient cache should be created");
    fs::write(transient_cache.join("audio.nbc"), b"cache")
        .expect("transient data should be written");
    fs::write(transient_cache.join("audio.nbi"), b"cache")
        .expect("transient index should be written");

    prepare_installed_runtime(&root.0, &authority)
        .expect("installed package cache cleanup should succeed");
    assert!(installed.exists());

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
    for relative in [
        "cb/2",
        "profiles/chatterbox-multilingual-v3-cuda-bf16-default-v4/2",
    ] {
        let managed = TestRoot::new();
        let retained = managed.0.join(relative);
        fs::create_dir_all(retained.parent().unwrap()).unwrap();
        symlink(&outside.0, &retained).unwrap();
        assert_eq!(
            OptionalChatterboxManager::default().remove_at(&managed.0),
            Err(OptionalProfileError::VerificationFailed)
        );
        assert!(outside.0.join("runtime/python.exe").exists());
    }
}

#[test]
fn removal_rejects_an_active_download_without_touching_staging() {
    let root = TestRoot::new();
    let staging = staging_root(&root.0).join("operation");
    fs::create_dir_all(&staging).expect("staging fixture should be created");
    fs::write(staging.join("partial.bin"), b"partial").expect("staging fixture should be written");
    let retained = retained_package_root(&root.0);
    let legacy = legacy_package_root(&root.0);
    for directory in [&retained, &legacy] {
        fs::create_dir_all(directory).unwrap();
        fs::write(directory.join("keep.bin"), b"historical").unwrap();
    }
    let manager = OptionalChatterboxManager::default();
    manager.set_operation(
        OptionalProfileState::Downloading,
        1,
        None,
        Some(Arc::new(AtomicBool::new(false))),
    );

    assert_eq!(manager.remove_at(&root.0), Err(OptionalProfileError::Busy));
    assert!(staging.join("partial.bin").exists());
    for directory in [&retained, &legacy] {
        assert_eq!(fs::read(directory.join("keep.bin")).unwrap(), b"historical");
    }
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
    fs::remove_file(root.0.join("unexpected.txt")).expect("unexpected fixture should be removed");

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
    for name in [
        "../outside.txt".to_owned(),
        "other-package/outside.txt".to_owned(),
        format!("{PACKAGE_ID}/../outside.txt"),
        format!("{PACKAGE_ID}//outside.txt"),
        format!("{PACKAGE_ID}/C:/outside.txt"),
        format!("{PACKAGE_ID}/runtime\\outside.txt"),
    ] {
        let root = TestRoot::new();
        let archive_path = root.0.join("unsafe.zip");
        {
            let file = File::create(&archive_path).expect("archive should be created");
            let mut archive = zip::ZipWriter::new(file);
            archive
                .start_file(name, zip::write::SimpleFileOptions::default())
                .expect("unsafe entry fixture should be added");
            archive
                .write_all(b"outside")
                .expect("fixture should be written");
            archive.finish().expect("archive should finish");
        }
        assert!(matches!(
            extract_archive(
                &archive_path,
                &root.0.join("extract"),
                1024,
                &AtomicBool::new(false),
            ),
            Err(OptionalProfileError::VerificationFailed | OptionalProfileError::Invalid)
        ));
        assert!(!root.0.join("outside.txt").exists());
        assert!(!root.0.join("extract").exists());
    }
}

#[test]
fn extraction_accepts_stored_and_deflated_files_only_within_the_total_limit() {
    for method in [
        zip::CompressionMethod::Stored,
        zip::CompressionMethod::Deflated,
    ] {
        let root = TestRoot::new();
        let archive_path = root.0.join("package.zip");
        let mut archive = zip::ZipWriter::new(File::create(&archive_path).unwrap());
        for (name, bytes) in [
            ("runtime/python.exe", b"payload".as_slice()),
            ("runtime/data", b"abc".as_slice()),
        ] {
            archive
                .start_file(
                    format!("{PACKAGE_ID}/{name}"),
                    zip::write::SimpleFileOptions::default().compression_method(method),
                )
                .unwrap();
            archive.write_all(bytes).unwrap();
        }
        archive.finish().unwrap();

        let exact = root.0.join("exact");
        assert_eq!(
            extract_archive(&archive_path, &exact, 10, &AtomicBool::new(false)),
            Ok(())
        );
        assert_eq!(
            fs::read(exact.join("runtime/python.exe")).unwrap(),
            b"payload"
        );
        assert_eq!(fs::read(exact.join("runtime/data")).unwrap(), b"abc");

        let limited = root.0.join("limited");
        assert_eq!(
            extract_archive(&archive_path, &limited, 9, &AtomicBool::new(false)),
            Err(OptionalProfileError::VerificationFailed)
        );
        assert!(!limited.join("runtime/data").exists());
    }
}

#[test]
fn extraction_rejects_symbolic_link_entries_without_creating_the_target() {
    let root = TestRoot::new();
    let archive_path = root.0.join("link.zip");
    let mut archive = zip::ZipWriter::new(File::create(&archive_path).unwrap());
    archive
        .add_symlink(
            format!("{PACKAGE_ID}/runtime/link"),
            "../../outside.txt",
            zip::write::SimpleFileOptions::default(),
        )
        .unwrap();
    archive.finish().unwrap();
    let target = root.0.join("extract");
    assert_eq!(
        extract_archive(&archive_path, &target, 1024, &AtomicBool::new(false)),
        Err(OptionalProfileError::VerificationFailed)
    );
    assert!(!target.exists());
    assert!(!root.0.join("outside.txt").exists());
}

#[test]
fn extraction_rejects_corrupt_entry_bytes_and_truncated_archives() {
    let root = TestRoot::new();
    let archive_path = root.0.join("package.zip");
    let mut archive = zip::ZipWriter::new(File::create(&archive_path).unwrap());
    archive
        .start_file(
            format!("{PACKAGE_ID}/runtime/data"),
            zip::write::SimpleFileOptions::default()
                .compression_method(zip::CompressionMethod::Stored),
        )
        .unwrap();
    archive.write_all(b"payload").unwrap();
    archive.finish().unwrap();
    let data_start = {
        let mut archive = ZipArchive::new(File::open(&archive_path).unwrap()).unwrap();
        archive.by_index(0).unwrap().data_start().unwrap() as usize
    };
    let original = fs::read(&archive_path).unwrap();
    let mut corrupt = original.clone();
    corrupt[data_start] ^= 1;
    fs::write(&archive_path, corrupt).unwrap();
    assert_eq!(
        extract_archive(
            &archive_path,
            &root.0.join("corrupt"),
            7,
            &AtomicBool::new(false)
        ),
        Err(OptionalProfileError::VerificationFailed)
    );

    fs::write(&archive_path, &original[..original.len() - 10]).unwrap();
    assert_eq!(
        extract_archive(
            &archive_path,
            &root.0.join("truncated"),
            7,
            &AtomicBool::new(false)
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
    fs::write(&path, vec![7_u8; 2 * 1024 * 1024]).expect("fixture should be written");
    // Independent SHA-256 reference for two MiB of byte 0x07.
    let expected = "c406296b30d433e27c08e2989ad557c7e9ae7825d1bea14c42aa4ef53c9e8a9d";
    let actual = std::thread::Builder::new()
        .stack_size(256 * 1024)
        .spawn(move || sha256_file(&path))
        .expect("bounded-stack worker should start")
        .join()
        .expect("bounded-stack hashing should not overflow")
        .expect("fixture should hash");
    assert_eq!(actual, expected);
}

#[test]
fn ordinary_snapshot_cleans_an_incomplete_prior_operation_and_reports_absent() {
    let root = TestRoot::new();
    let stale_staging = staging_root(&root.0).join("operation/package.zip");
    fs::create_dir_all(stale_staging.parent().expect("parent should exist"))
        .expect("staging fixture should be created");
    fs::write(&stale_staging, b"incomplete").expect("staging fixture should be written");
    let manager = OptionalChatterboxManager::default();
    let before = manager
        .snapshot_at(&root.0)
        .expect("snapshot should succeed");
    assert_eq!(before.state, OptionalProfileState::Absent);
    assert!(!stale_staging.exists());
    assert!(!profile_root(&root.0).exists());
}

#[test]
fn native_host_gate_rejects_before_confirmation_staging_or_network_work() {
    let root = TestRoot::new();
    let manager = OptionalChatterboxManager::default();

    assert_eq!(
        select_at_if_host_admitted(&manager, &root.0, false),
        Err(OptionalProfileError::IncompatibleHost)
    );
    assert_eq!(
        download_at_if_host_admitted(&manager, &root.0, false),
        Err(OptionalProfileError::IncompatibleHost)
    );

    let manifest = exact_manifest().expect("checked in manifest should be valid");
    assert!(manager.operation_snapshot(&manifest).is_none());
    assert!(!staging_root(&root.0).exists());
    assert!(!profile_root(&root.0).exists());
}

#[test]
fn ordinary_selection_requires_confirmation_without_creating_staging() {
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
    assert_eq!(selected.download_bytes, Some(8_239_933_601));
    assert_eq!(selected.minimum_free_bytes, Some(20_000_000_000));
    assert!(!staging_root(&root.0).exists());
    assert!(!profile_root(&root.0).exists());
}
#[test]
fn successor_authority_has_exact_new_identity_and_no_legacy_correction() {
    let manifest = exact_manifest().expect("v3 authority valid");
    assert_eq!(manifest.identity.package_version, "3");
    assert_eq!(manifest.layout.installed, "cb/3");
    assert!(manifest.runtime_correction.is_none());
    let runtime = manifest.runtime_artifact.as_ref().unwrap();
    assert_eq!(
        runtime
            .parts
            .iter()
            .map(|part| part.download_bytes)
            .sum::<u64>(),
        5_030_981_677
    );
    assert_eq!(runtime.installed_bytes, 5_027_425_801);
    let measurements = manifest.measurements.as_ref().unwrap();
    assert_eq!(measurements.download_bytes, 8_239_933_601);
    assert_eq!(measurements.installed_bytes, 8_236_377_725);
    assert_eq!(measurements.temporary_bytes, 13_270_915_278);
    let mut changed = manifest.clone();
    changed.runtime_correction = serde_json::from_slice::<OptionalPackageManifest>(include_bytes!(
        "../../../../../services/tts/release/optional/chatterbox/optional-package-manifest-v2.json"
    ))
    .unwrap()
    .runtime_correction;
    assert_eq!(
        validate_manifest(&changed),
        Err(OptionalProfileError::Invalid)
    );
    changed = manifest;
    changed.identity.package_version = "2".to_owned();
    assert_eq!(
        validate_manifest(&changed),
        Err(OptionalProfileError::Invalid)
    );
}

#[test]
fn retained_v2_is_cleanup_only_and_survives_observation_and_cancellation() {
    for roots in [
        vec!["cb/2"],
        vec!["profiles/chatterbox-multilingual-v3-cuda-bf16-default-v4/2"],
        vec![
            "cb/2",
            "profiles/chatterbox-multilingual-v3-cuda-bf16-default-v4/2",
        ],
    ] {
        for withheld in [false, true] {
            let root = TestRoot::new();
            for relative in &roots {
                let directory = root.0.join(relative);
                fs::create_dir_all(&directory).unwrap();
                fs::write(directory.join("keep.bin"), b"historical").unwrap();
            }
            let unrelated = root.0.join("cb/other-version");
            let unrelated_profile = root.0.join("profiles/unrelated/2");
            for directory in [&unrelated, &unrelated_profile] {
                fs::create_dir_all(directory).unwrap();
                fs::write(directory.join("keep.bin"), b"unrelated").unwrap();
            }
            let manager = OptionalChatterboxManager::default();
            let mut authority = exact_manifest().unwrap();
            if withheld {
                authority.availability = "withheld".to_owned();
            }
            let snapshot = manager.snapshot_with_manifest(&root.0, &authority).unwrap();
            assert_eq!(snapshot.state, OptionalProfileState::Failed);
            assert_eq!(snapshot.failure, Some("tts-optional-profile-unavailable"));
            assert_eq!(snapshot.installed_bytes, None);
            manager.select_at(&root.0).unwrap();
            manager.cancel_at(&root.0).unwrap();
            for relative in &roots {
                assert_eq!(
                    fs::read(root.0.join(relative).join("keep.bin")).unwrap(),
                    b"historical"
                );
            }
            assert!(!package_root(&root.0).exists());
            assert_eq!(
                prepare_and_verify_installed_runtime(&root.0, &authority, false),
                Err(OptionalProfileError::VerificationFailed)
            );
            manager.remove_with_manifest(&root.0, &authority).unwrap();
            for relative in &roots {
                assert!(!root.0.join(relative).exists());
            }
            for directory in [&unrelated, &unrelated_profile] {
                assert_eq!(fs::read(directory.join("keep.bin")).unwrap(), b"unrelated");
            }
        }
    }
}

#[test]
fn valid_v3_wins_over_retained_v2_and_withheld_removal_still_cleans_owned_roots() {
    let root = TestRoot::new();
    let active = package_root(&root.0);
    let authority = write_runtime(&active);
    let retained = retained_package_root(&root.0);
    fs::create_dir_all(&retained).unwrap();
    fs::write(retained.join("keep.bin"), b"retained").unwrap();
    let manager = OptionalChatterboxManager::default();
    assert_eq!(
        manager
            .snapshot_with_manifest(&root.0, &authority)
            .unwrap()
            .state,
        OptionalProfileState::Installed
    );
    assert_eq!(fs::read(retained.join("keep.bin")).unwrap(), b"retained");
    let mut withheld = authority;
    withheld.availability = "withheld".to_owned();
    let unavailable = manager.snapshot_with_manifest(&root.0, &withheld).unwrap();
    assert_eq!(unavailable.state, OptionalProfileState::Failed);
    assert_eq!(
        unavailable.failure,
        Some("tts-optional-profile-unavailable")
    );
    assert_eq!(unavailable.installed_bytes, None);
    assert_eq!(
        manager
            .remove_with_manifest(&root.0, &withheld)
            .unwrap()
            .state,
        OptionalProfileState::Withheld
    );
    assert!(!active.exists());
    assert!(!retained.exists());
}
