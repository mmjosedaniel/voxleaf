//! Opt-in admission of the exact published parts; never touches user app data.

use super::*;
use std::{cell::RefCell, collections::HashMap, rc::Rc};

type LocalSources = Rc<HashMap<PathBuf, (PathBuf, RuntimePart)>>;

fn arm_local_download(sources: LocalSources, seen: Rc<RefCell<HashSet<PathBuf>>>) {
    DOWNLOAD_HOOK.with(|slot| {
        *slot.borrow_mut() = Some(Box::new(move |destination, cancelled| {
            // Re-arm even after the ninth request: an extra request must fail,
            // never fall through to the real HTTP downloader.
            arm_local_download(Rc::clone(&sources), Rc::clone(&seen));
            let (source, identity) = sources
                .get(destination)
                .ok_or(OptionalProfileError::VerificationFailed)?;
            if !seen.borrow_mut().insert(destination.to_path_buf()) {
                return Err(OptionalProfileError::VerificationFailed);
            }
            if cancelled.load(Ordering::Acquire) {
                return Err(OptionalProfileError::Cancelled);
            }
            fs::copy(source, destination).map_err(|_| OptionalProfileError::DownloadFailed)?;
            verify_downloaded_artifact(identity, destination, cancelled)?;
            eprintln!("exact-local: verified artifact {}", seen.borrow().len());
            Ok(())
        }));
    });
}

struct ClearDownloadHook;

impl Drop for ClearDownloadHook {
    fn drop(&mut self) {
        DOWNLOAD_HOOK.with(|slot| *slot.borrow_mut() = None);
    }
}

#[test]
#[ignore = "explicit exact local artifacts and models; no HTTP or user installation"]
#[allow(clippy::assertions_on_constants)] // Reject explicit runs without release admission.
fn optional_v7_exact_local_acquisition_replay() {
    assert!(cfg!(feature = "release-locked-runtime"));
    let parts = PathBuf::from(std::env::var_os("VOXLEAF_V7_PARTS").expect("parts directory"));
    let models = PathBuf::from(std::env::var_os("VOXLEAF_V7_MODELS").expect("models directory"));
    assert!(parts.is_absolute() && models.is_absolute());
    let root = TestRoot::new();
    let authority = exact_manifest().unwrap();
    assert_eq!(authority.identity.package_version, "7");
    let downloads = staging_root(&root.0).join("operation/downloads");
    let mut sources = HashMap::new();
    for part in &authority.runtime_artifact.as_ref().unwrap().parts {
        sources.insert(
            downloads.join("runtime").join(&part.filename),
            (parts.join(&part.filename), part.clone()),
        );
    }
    for model in &authority.model_artifacts {
        sources.insert(
            downloads.join("models").join(&model.filename),
            (
                models.join(&model.filename),
                RuntimePart {
                    filename: model.filename.clone(),
                    url: model.url.clone(),
                    sha256: model.sha256.clone(),
                    download_bytes: model.download_bytes,
                },
            ),
        );
    }
    assert_eq!(sources.len(), 9);
    assert!(sources.values().all(|(source, _)| source.is_file()));
    let retained = retained_v6_package_root(&root.0);
    let unrelated = root.0.join("unrelated");
    for directory in [&retained, &unrelated] {
        fs::create_dir_all(directory).unwrap();
        fs::write(directory.join("keep.bin"), b"synthetic sentinel").unwrap();
    }
    let manager = OptionalChatterboxManager::default();
    assert_eq!(
        manager.select_at(&root.0).unwrap().state,
        OptionalProfileState::Confirming
    );
    let seen = Rc::new(RefCell::new(HashSet::new()));
    let _clear = ClearDownloadHook;
    arm_local_download(Rc::new(sources), Rc::clone(&seen));
    assert_eq!(
        manager.download_at(&root.0).unwrap().state,
        OptionalProfileState::Installed
    );
    assert_eq!(seen.borrow().len(), 9);
    assert!(!staging_root(&root.0).exists());
    assert_eq!(
        fs::read(retained.join("keep.bin")).unwrap(),
        b"synthetic sentinel"
    );
    invalidate_verified_runtime_receipt();
    let fresh = OptionalChatterboxManager::default();
    assert_eq!(
        fresh.snapshot_at(&root.0).unwrap().state,
        OptionalProfileState::Installed
    );
    prepare_and_verify_installed_runtime(&root.0, &authority).unwrap();

    // Exercise the interpreter admitted at cb/7, with bounded synthetic audio.
    let script = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../../../scripts/test-chatterbox-runtime-smoke.py");
    for language in ["es", "en"] {
        let mut child =
            std::process::Command::new(package_root(&root.0).join("runtime/python.exe"))
                .args(["-I", "-B"])
                .arg(&script)
                .args(["--package-version", "7", "--language", language, "--models"])
                .arg(package_root(&root.0).join("models"))
                .env("HF_HUB_OFFLINE", "1")
                .env("TRANSFORMERS_OFFLINE", "1")
                .env("NUMBA_CACHE_DIR", root.0.join("numba"))
                .spawn()
                .unwrap();
        let started = std::time::Instant::now();
        loop {
            if let Some(status) = child.try_wait().unwrap() {
                assert!(status.success(), "admitted runtime smoke failed");
                break;
            }
            if started.elapsed() > Duration::from_secs(180) {
                let killed = std::process::Command::new("taskkill.exe")
                    .args(["/PID", &child.id().to_string(), "/T", "/F"])
                    .status()
                    .expect("terminate the task-owned smoke process tree");
                assert!(killed.success(), "smoke process-tree termination failed");
                child.wait().unwrap();
                panic!("admitted runtime smoke timed out");
            }
            thread::sleep(Duration::from_millis(100));
        }
    }
    invalidate_verified_runtime_receipt();
    prepare_and_verify_installed_runtime(&root.0, &authority).unwrap();
    assert_eq!(
        fresh.remove_at(&root.0).unwrap().state,
        OptionalProfileState::Absent
    );
    assert!(!package_root(&root.0).exists());
    assert!(!retained.exists());
    assert_eq!(
        fs::read(unrelated.join("keep.bin")).unwrap(),
        b"synthetic sentinel"
    );
    eprintln!("exact-local: admission, rediscovery, ES/EN, integrity and owned removal passed");
}
