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
            "sha256": encode_sha256(Sha256::digest(bytes)),
            "sizeBytes": bytes.len(),
        }));
    }
    let manifest = serde_json::to_vec(&serde_json::json!({
        "schemaVersion": 1,
        "packageId": PACKAGE_ID,
        "packageVersion": "1",
        "platform": "windows-x86_64",
        "coreLockSha256": "27ea7e0701439689bbdbac8fc81867489b5ad0f0d1e0052e6cdeb938e505ff97",
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
fn tracked_manifest_matches_core_lock_and_native_authority() {
    let mut manifest: RuntimeManifest =
        serde_json::from_slice(TRUSTED_MANIFEST).expect("tracked manifest should deserialize");
    let core_lock = include_bytes!("../../../../../services/tts/release/core/uv.lock");
    assert_eq!(
        manifest.core_lock_sha256,
        encode_sha256(Sha256::digest(core_lock))
    );
    assert_eq!(validate_manifest_authority(&manifest), Ok(()));

    manifest.core_lock_sha256 = "0".repeat(64);
    assert_eq!(
        validate_manifest_authority(&manifest),
        Err(PackagedCoreError::Invalid)
    );
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
    for (relative, replacement) in [
        ("runtime/python.exe", b"py".as_slice()),
        ("runtime/python.exe", b"pyth0n".as_slice()),
        ("voices/es/model.onnx", b"changed".as_slice()),
        ("stale.txt", b"changed".as_slice()),
    ] {
        let root = TestRoot::new();
        let manifest = write_test_package(&root.0);
        fs::write(root.0.join(relative), replacement).expect("mutation should succeed");
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
