//! Explicit retained-v7 diagnostics through the production command and supervisor.
use super::*;
use sha2::{Digest, Sha256};
use std::io::Read;

const MANIFEST_SHA256: &str = "48b392d82e9937e369170fd5c816b7a4ad766009f8816739441dddbd076c5d8a";

fn hash_file(path: &Path) -> String {
    let mut file = fs::File::open(path).unwrap();
    let mut digest = Sha256::new();
    let mut buffer = [0_u8; 65_536];
    loop {
        let count = file.read(&mut buffer).unwrap();
        if count == 0 {
            break;
        }
        digest.update(&buffer[..count]);
    }
    crate::sha256_hex::encode_sha256(digest.finalize())
}

fn package() -> PathBuf {
    let root = PathBuf::from(
        std::env::var_os("VOXLEAF_V7_RUNTIME").expect("verified retained v7 root required"),
    );
    let root = root.canonicalize().unwrap();
    assert_eq!(
        hash_file(&root.join("runtime-manifest-v7.json")),
        MANIFEST_SHA256
    );
    root
}

fn verify_runtime(root: &Path) {
    let manifest: Value =
        serde_json::from_slice(&fs::read(root.join("runtime-manifest-v7.json")).unwrap()).unwrap();
    let files = manifest["files"].as_array().unwrap();
    for entry in files {
        let path = root.join(entry["path"].as_str().unwrap());
        assert_eq!(
            fs::metadata(&path).unwrap().len(),
            entry["sizeBytes"].as_u64().unwrap()
        );
        assert_eq!(hash_file(&path), entry["sha256"].as_str().unwrap());
    }
    eprintln!("native-v7: verified {} manifest-owned files", files.len());
}

fn scratch(label: &str) -> PathBuf {
    let base = PathBuf::from(
        std::env::var_os("VOXLEAF_V7_SCRATCH").expect("short disposable scratch root required"),
    );
    assert!(base.is_absolute());
    let root = base.join(format!("{label}-{}", std::process::id()));
    assert!(!root.exists(), "use a fresh diagnostic root");
    fs::create_dir_all(&root).unwrap();
    root
}

fn runtime(root: &Path, models: &Path, cache: &Path, language: &'static str) -> ExactRuntime {
    let site = root.join("runtime/Lib/site-packages");
    ExactRuntime {
        python: root.join("runtime/python.exe"),
        model_root: models.to_path_buf(),
        service_source: site.clone(),
        service_site_packages: site,
        service_module: "voxleaf_tts.chatterbox_service",
        runtime_environment: vec![("VOXLEAF_TTS_RUNTIME_CHATTERBOX_LANGUAGE", language)],
        numba_cache_root: Some(cache.to_path_buf()),
    }
}

#[test]
#[ignore = "explicit verified retained v7; cold private loader and controlled negatives, no models"]
#[allow(clippy::assertions_on_constants)]
fn packaged_v7_private_loader() {
    assert!(cfg!(feature = "release-locked-runtime"));
    let root = package();
    verify_runtime(&root);
    let scratch = scratch("loader");
    let exact = runtime(&root, &scratch, &scratch.join("cache"), "es");
    let output = exact
        .command()
        .unwrap()
        .arg("--loader-probe")
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "cold private dependency import failed: {:?}",
        output.status.code()
    );
    let report: Value = serde_json::from_slice(&output.stdout).unwrap();
    assert_eq!(report["torch"], "2.9.1+cu128");
    assert_eq!(report["cudaInitialized"], false);
    assert_eq!(
        report["privateDllOrigins"],
        json!([
            "vcruntime140.dll",
            "vcruntime140_1.dll",
            "Lib/site-packages/sklearn/.libs/msvcp140.dll"
        ])
    );
    eprintln!("native-v7-loader: {report}");
    for invalid in [false, true] {
        let site = scratch.join(if invalid { "invalid" } else { "missing" });
        fs::create_dir_all(site.join("sklearn/.libs")).unwrap();
        if invalid {
            fs::write(
                site.join("sklearn/.libs/msvcp140.dll"),
                b"invalid DLL fixture",
            )
            .unwrap();
        }
        let negative = ExactRuntime {
            service_source: site.clone(),
            service_site_packages: site,
            ..exact.clone()
        };
        let output = negative
            .command()
            .unwrap()
            .arg("--loader-probe")
            .output()
            .unwrap();
        assert!(!output.status.success());
        assert!(
            output.stdout.is_empty(),
            "negative must not enter service or import diagnostic"
        );
    }
    assert!(!scratch.read_dir().unwrap().any(|entry| {
        entry
            .unwrap()
            .path()
            .extension()
            .is_some_and(|ext| ext == "wav")
    }));
    fs::write(
        scratch.join("loader-result.json"),
        serde_json::to_vec_pretty(&report).unwrap(),
    )
    .unwrap();
}

struct StopOwnedSupervisor(Arc<TtsServiceSupervisor>);
impl Drop for StopOwnedSupervisor {
    fn drop(&mut self) {
        let _ = self.0.force_stop();
        CHATTERBOX_OBSERVER.with(|slot| *slot.borrow_mut() = None);
    }
}

#[test]
#[ignore = "explicit retained v7 and exact models; sequential real supervised ES/EN, no downloads"]
#[allow(clippy::assertions_on_constants)]
fn packaged_v7_supervised_bilingual() {
    assert!(cfg!(feature = "release-locked-runtime"));
    let root = package();
    let models = PathBuf::from(
        std::env::var_os("VOXLEAF_V7_MODELS").expect("six verified existing model files required"),
    )
    .canonicalize()
    .unwrap();
    let scratch = scratch("bilingual");
    let observer = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../../scripts/test-chatterbox-runtime-smoke.py")
        .canonicalize()
        .unwrap();
    let supervisor = Arc::new(TtsServiceSupervisor::with_child(ServiceChild::Unavailable));
    let _cleanup = StopOwnedSupervisor(Arc::clone(&supervisor));
    let mut receipts = Vec::new();
    let mut previous_id = None;
    for language in ["es", "en"] {
        let exact = runtime(&root, &models, &scratch.join("cache"), language);
        let observed_path = scratch.join(format!("{language}-observation.json"));
        CHATTERBOX_OBSERVER.with(|slot| {
            *slot.borrow_mut() = Some((
                exact.python.clone(),
                observer.clone(),
                observed_path.clone(),
            ))
        });
        *supervisor.child_configuration.lock().unwrap() = ServiceChild::Exact(exact);
        let started = Instant::now();
        supervisor.start().unwrap();
        let id = supervisor
            .active_session()
            .unwrap()
            .service_instance_id
            .clone();
        assert_ne!(previous_id.as_ref(), Some(&id));
        let prepared = supervisor.prepare_measured().unwrap();
        verify_exact_capabilities(&prepared.records).unwrap();
        let mut segment = fixture_segment();
        segment["text"] = json!(if language == "es" {
            "La prueba conserva 0.25 % y 12:14:30 sin guardar audio."
        } else {
            "This test preserves 0.25 % and 12:14:30 without saving audio."
        });
        let audio = supervisor.synthesize(segment.clone()).unwrap();
        verify_exact_audio(&audio).unwrap();
        assert!(
            audio
                .chunks_exact(4)
                .all(|sample| f32::from_le_bytes(sample.try_into().unwrap()).is_finite())
        );
        assert!(
            audio
                .chunks_exact(4)
                .any(|sample| f32::from_le_bytes(sample.try_into().unwrap()).abs() > 0.00001)
        );
        let pcm_bytes = audio.len();
        drop(audio);
        supervisor.health().unwrap();
        let generation = Arc::clone(&supervisor);
        let worker = thread::spawn(move || generation.synthesize(segment));
        let deadline = Instant::now() + HANDSHAKE_TIMEOUT;
        let active = loop {
            let lifecycle = supervisor.lifecycle.lock().unwrap();
            if lifecycle.state == "generating"
                && let Some(active) = &lifecycle.active
            {
                break active.clone();
            }
            drop(lifecycle);
            assert!(
                Instant::now() < deadline,
                "in-flight generation not observed"
            );
            thread::sleep(POLL_INTERVAL);
        };
        let cancel_started = Instant::now();
        supervisor
            .cancel(CancelScope {
                session_id: active.session_id,
                generation_id: active.generation_id,
                segment_id: active.segment_id,
            })
            .unwrap();
        assert_eq!(worker.join().unwrap(), Err(TtsNativeFailure::Cancelled));
        let cancel_ms = cancel_started.elapsed().as_millis();
        assert!(cancel_ms <= TERMINATION_TIMEOUT.as_millis());
        assert!(supervisor.session.lock().unwrap().is_none());
        assert!(supervisor.lifecycle.lock().unwrap().active.is_none());
        let observation: Value = serde_json::from_slice(&fs::read(observed_path).unwrap()).unwrap();
        assert_eq!(observation["networkAttempts"], 0);
        assert_eq!(observation["audioFilesWritten"], 0);
        assert_eq!(observation["cudaCapability"], json!([12, 0]));
        assert!(
            observation["activationDtypes"].is_array(),
            "effective activation dtype must be observed"
        );
        let receipt = json!({"language":language,"pcmBytes":pcm_bytes,"cancelMs":cancel_ms,"elapsedMs":started.elapsed().as_millis(),"loadMs":prepared.load_elapsed.as_millis(),"warmMs":prepared.warm_elapsed.as_millis(),"observation":observation});
        eprintln!("native-v7-supervisor: {receipt}");
        receipts.push(receipt);
        previous_id = Some(id);
    }
    supervisor.force_stop().unwrap();
    verify_runtime(&root);
    fs::write(
        scratch.join("bilingual-result.json"),
        serde_json::to_vec_pretty(&receipts).unwrap(),
    )
    .unwrap();
}
