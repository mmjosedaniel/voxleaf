use super::*;
#[cfg(windows)]
mod exact_local;
use std::{
    sync::{
        Barrier,
        atomic::{AtomicU64, Ordering},
    },
    thread,
    time::{Duration, SystemTime, UNIX_EPOCH},
};

static COUNTER: AtomicU64 = AtomicU64::new(1);

thread_local! {
    static R7_TRANSFER_PUBLICATION: std::cell::RefCell<Option<Box<dyn FnOnce()>>> = const { std::cell::RefCell::new(None) };
}

pub(super) fn r7_before_transfer_publication() {
    R7_TRANSFER_PUBLICATION.with(|slot| {
        if let Some(hook) = slot.borrow_mut().take() {
            hook();
        }
    });
}

#[cfg(windows)]
#[test]
fn r7_02_cancel_before_transfer_handle_publication_joins_and_cleans() {
    let root = TestRoot::new();
    let manager = Arc::new(OptionalChatterboxManager::default());
    manager.set_operation(OptionalProfileState::Confirming, 0, None, None);
    let cancelling = Arc::clone(&manager);
    let cancel_root = root.0.clone();
    R7_TRANSFER_PUBLICATION.with(|slot| {
        *slot.borrow_mut() = Some(Box::new(move || {
            cancelling.cancel_at(&cancel_root).unwrap();
        }))
    });
    let downloading = Arc::clone(&manager);
    DOWNLOAD_HOOK.with(|slot| {
        *slot.borrow_mut() = Some(Box::new(move |_destination, cancelled| {
            let client = reqwest::Client::builder().no_proxy().build().unwrap();
            let diagnostic = DownloadAttempt::new(
                &downloading.last_download_error,
                DownloadSource::GithubRelease,
                1,
                100,
            );
            send_download_request(
                client.get("http://127.0.0.1:9/"),
                cancelled,
                &diagnostic,
                &downloading.transfer_abort,
            )
            .map(|_| ())
        }))
    });
    let began = std::time::Instant::now();
    assert!(manager.download_at(&root.0).is_ok());
    assert!(began.elapsed() < Duration::from_secs(2));
    assert!(manager.transfer_abort.lock().unwrap().is_none());
    assert!(!manager.operation.lock().unwrap().worker_active);
    assert!(!staging_root(&root.0).exists());
}

#[test]
fn r7_02_normal_transfer_verifies_bytes_and_releases_task() {
    let root = TestRoot::new();
    let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
    let address = listener.local_addr().unwrap();
    let server = thread::spawn(move || {
        let (mut stream, _) = listener.accept().unwrap();
        stream.set_nonblocking(false).unwrap();
        stream
            .set_read_timeout(Some(Duration::from_secs(5)))
            .unwrap();
        stream
            .set_write_timeout(Some(Duration::from_secs(5)))
            .unwrap();
        let mut request = [0; 1024];
        assert!(stream.read(&mut request).unwrap() > 0);
        stream
            .write_all(b"HTTP/1.1 200 OK\r\nContent-Length: 4\r\n\r\ntest")
            .unwrap();
    });
    let diagnostic_slot = Mutex::new(None);
    let abort = TransferAbort::default();
    let cancelled = AtomicBool::new(false);
    let diagnostic = DownloadAttempt::new(&diagnostic_slot, DownloadSource::GithubRelease, 1, 4);
    let client = reqwest::Client::builder()
        .no_proxy()
        .read_timeout(Duration::from_secs(5))
        .build()
        .unwrap();
    let response = send_download_request(
        client.get(format!("http://{address}/")),
        &cancelled,
        &diagnostic,
        &abort,
    )
    .unwrap();
    let mut artifact = runtime_artifact("0".repeat(64)).parts.remove(0);
    artifact.sha256 = encode_sha256(Sha256::digest(b"test"));
    artifact.download_bytes = 4;
    let destination = root.0.join("complete.bin");
    let result = copy_download_response(
        &artifact,
        response,
        &destination,
        &cancelled,
        |_| {},
        diagnostic,
    );
    server.join().unwrap();
    result.unwrap();
    assert_eq!(fs::read(destination).unwrap(), b"test");
    assert!(abort.lock().unwrap().is_none());
    assert!(diagnostic_slot.lock().unwrap().is_none());
}

#[cfg(windows)]
#[test]
fn r7_02_cancellation_settles_stalled_headers_with_owned_cleanup() {
    r7_stalled_transfer(false);
}

#[cfg(windows)]
#[test]
fn r7_02_cancellation_settles_stalled_body_with_owned_cleanup() {
    r7_stalled_transfer(true);
}

#[cfg(windows)]
fn r7_stalled_transfer(body: bool) {
    {
        let root = TestRoot::new();
        let manager = Arc::new(OptionalChatterboxManager::default());
        manager.set_operation(OptionalProfileState::Confirming, 0, None, None);
        let retained = retained_v6_package_root(&root.0);
        fs::create_dir_all(&retained).unwrap();
        fs::write(retained.join("keep.bin"), b"retained").unwrap();
        let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        listener.set_nonblocking(true).unwrap();
        let address = listener.local_addr().unwrap();
        let cancelling = Arc::clone(&manager);
        let cancel_root = root.0.clone();
        let (done, finished) = std::sync::mpsc::channel();
        let server = thread::spawn(move || {
            let deadline = std::time::Instant::now() + Duration::from_secs(5);
            let mut stream = loop {
                match listener.accept() {
                    Ok((stream, _)) => break stream,
                    Err(error) if error.kind() == std::io::ErrorKind::WouldBlock => {
                        assert!(std::time::Instant::now() < deadline);
                        thread::sleep(Duration::from_millis(5));
                    }
                    Err(error) => panic!("loopback accept: {:?}", error.kind()),
                }
            };
            stream.set_nonblocking(false).unwrap();
            stream
                .set_read_timeout(Some(Duration::from_secs(5)))
                .unwrap();
            stream
                .set_write_timeout(Some(Duration::from_secs(5)))
                .unwrap();
            let mut request = [0; 1024];
            assert!(stream.read(&mut request).unwrap() > 0);
            if body {
                stream
                    .write_all(b"HTTP/1.1 200 OK\r\nContent-Length: 100\r\n\r\nx")
                    .unwrap();
            }
            // For the body arm, wait for the production copy owner to consume x.
            if body {
                while cancelling.operation.lock().unwrap().downloaded_bytes == 0 {
                    assert!(std::time::Instant::now() < deadline);
                    thread::sleep(Duration::from_millis(1));
                }
            }
            let started = std::time::Instant::now();
            cancelling.cancel_at(&cancel_root).unwrap();
            let completed = finished.recv_timeout(Duration::from_secs(4)).is_ok();
            (completed, started.elapsed())
        });
        let downloading = Arc::clone(&manager);
        DOWNLOAD_HOOK.with(|slot| {
            *slot.borrow_mut() = Some(Box::new(move |destination, cancelled| {
                let client = reqwest::Client::builder()
                    .no_proxy()
                    .timeout(Duration::from_secs(3))
                    .build()
                    .unwrap();
                let diagnostic = DownloadAttempt::new(
                    &downloading.last_download_error,
                    DownloadSource::GithubRelease,
                    1,
                    100,
                );
                let response = send_download_request(
                    client.get(format!("http://{address}/")),
                    cancelled,
                    &diagnostic,
                    &downloading.transfer_abort,
                )?;
                let mut artifact = runtime_artifact("0".repeat(64)).parts.remove(0);
                artifact.download_bytes = 100;
                copy_download_response(
                    &artifact,
                    response,
                    destination,
                    cancelled,
                    |count| {
                        downloading.operation.lock().unwrap().downloaded_bytes = count;
                    },
                    diagnostic,
                )
            }))
        });
        let result = manager.download_at(&root.0);
        done.send(()).unwrap();
        let (completed, elapsed) = server.join().unwrap();
        assert!(result.is_ok());
        assert!(!manager.operation.lock().unwrap().worker_active);
        assert!(!staging_root(&root.0).exists());
        assert_eq!(fs::read(retained.join("keep.bin")).unwrap(), b"retained");
        assert!(
            completed && elapsed < Duration::from_secs(2),
            "cancellation: {elapsed:?}"
        );
    }
}

#[test]
fn efc_06_discloses_effective_ram_without_changing_frozen_floor() {
    let manifest = exact_manifest().unwrap();
    assert_eq!(manifest.requirements.minimum_available_ram_mi_b, 4096);
    let snapshot = snapshot_from(&manifest, OptionalProfileState::Absent, 0, None);
    assert_eq!(snapshot.minimum_available_ram_mi_b, 7042);
}

#[cfg(windows)]
#[test]
fn saf16_cancelled_error_headers_preserve_diagnostic_and_clean_staging() {
    for (headers, kind) in [
        (
            "HTTP/1.1 503 Service Unavailable\r\nContent-Length: 100\r\n\r\n",
            DownloadFailureKind::HttpStatus,
        ),
        (
            "HTTP/1.1 200 OK\r\nContent-Length: 101\r\n\r\n",
            DownloadFailureKind::ContentLength,
        ),
    ] {
        for cancel in [false, true] {
            let root = TestRoot::new();
            let manager = Arc::new(OptionalChatterboxManager::default());
            manager.set_operation(OptionalProfileState::Confirming, 0, None, None);
            DownloadAttempt::new(
                &manager.last_download_error,
                DownloadSource::GithubRelease,
                1,
                100,
            )
            .fail(
                DownloadStage::Request,
                DownloadFailureKind::InvalidUrl,
                None,
            );
            let previous = *manager.last_download_error.lock().unwrap();
            let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
            listener.set_nonblocking(true).unwrap();
            let address = listener.local_addr().unwrap();
            let cancelling_manager = Arc::clone(&manager);
            let cancelling_root = root.0.clone();
            let server = thread::spawn(move || {
                let deadline = std::time::Instant::now() + Duration::from_secs(5);
                let mut stream = loop {
                    match listener.accept() {
                        Ok((stream, _)) => break stream,
                        Err(error) if error.kind() == std::io::ErrorKind::WouldBlock => {
                            assert!(std::time::Instant::now() < deadline);
                            thread::sleep(Duration::from_millis(5));
                        }
                        Err(error) => panic!("loopback accept failed: {:?}", error.kind()),
                    }
                };
                // Windows inherits the listener's nonblocking mode on accept.
                // Restore blocking I/O so the bounded timeouts govern request reads.
                stream.set_nonblocking(false).unwrap();
                stream
                    .set_read_timeout(Some(Duration::from_secs(5)))
                    .unwrap();
                stream
                    .set_write_timeout(Some(Duration::from_secs(5)))
                    .unwrap();
                let mut request = [0_u8; 1024];
                assert!(stream.read(&mut request).unwrap() > 0);
                if cancel {
                    let acknowledged = cancelling_manager.cancel_at(&cancelling_root).unwrap();
                    assert_eq!(acknowledged.state, OptionalProfileState::Downloading);
                    assert!(
                        cancelling_manager
                            .operation
                            .lock()
                            .unwrap()
                            .cancellation
                            .as_ref()
                            .unwrap()
                            .load(Ordering::Acquire)
                    );
                }
                // Rejected headers arrive only after cancellation was acknowledged.
                stream.write_all(headers.as_bytes()).unwrap();
            });
            let downloading_manager = Arc::clone(&manager);
            DOWNLOAD_HOOK.with(|slot| {
                *slot.borrow_mut() = Some(Box::new(move |destination, cancelled| {
                    let client = reqwest::Client::builder()
                        .no_proxy()
                        .timeout(Duration::from_secs(5))
                        .build()
                        .unwrap();
                    let diagnostic = DownloadAttempt::new(
                        &downloading_manager.last_download_error,
                        DownloadSource::GithubRelease,
                        1,
                        100,
                    );
                    let response = send_download_request(
                        client.get(format!("http://{address}/")),
                        cancelled,
                        &diagnostic,
                        &downloading_manager.transfer_abort,
                    )?;
                    let mut artifact = runtime_artifact("0".repeat(64)).parts.remove(0);
                    artifact.download_bytes = 100;
                    copy_download_response(
                        &artifact,
                        response,
                        destination,
                        cancelled,
                        |_| panic!("rejected headers cannot transfer bytes"),
                        diagnostic,
                    )
                }));
            });
            let result = manager.download_at(&root.0);
            server.join().unwrap();
            assert!(!manager.operation.lock().unwrap().worker_active);
            assert!(!staging_root(&root.0).exists());
            assert!(!package_root(&root.0).exists());
            if cancel {
                assert_eq!(result.unwrap().state, OptionalProfileState::Absent);
                assert_eq!(*manager.last_download_error.lock().unwrap(), previous);
            } else {
                assert_eq!(result, Err(OptionalProfileError::DownloadFailed));
                let report = manager.last_download_error.lock().unwrap().unwrap();
                assert_eq!(report.stage, DownloadStage::Response);
                assert_eq!(report.kind, kind);
                assert_eq!(report.received_bytes, 0);
            }
        }
    }
}

#[test]
fn saf02_cache_only_restart_retains_a_removal_route_without_admission() {
    for withheld in [false, true] {
        let root = TestRoot::new();
        let cache = profile_root(&root.0).join("cache");
        fs::create_dir_all(&cache).unwrap();
        fs::write(cache.join("owned.bin"), b"synthetic cache").unwrap();
        let sibling = profile_root(&root.0).join("unrelated");
        fs::create_dir_all(&sibling).unwrap();
        fs::write(sibling.join("keep.bin"), b"unrelated").unwrap();
        let mut authority = exact_manifest().unwrap();
        if withheld {
            authority.availability = "withheld".to_owned();
        }
        let restarted = OptionalChatterboxManager::default();
        let snapshot = restarted
            .snapshot_with_manifest(&root.0, &authority)
            .unwrap();
        assert_eq!(snapshot.state, OptionalProfileState::Failed);
        assert_eq!(snapshot.failure, Some("tts-optional-profile-unavailable"));
        assert_eq!(snapshot.installed_bytes, None);
        assert_eq!(
            prepare_and_verify_installed_runtime(&root.0, &authority),
            Err(OptionalProfileError::VerificationFailed)
        );
        restarted.remove_with_manifest(&root.0, &authority).unwrap();
        assert!(!cache.exists());
        assert_eq!(fs::read(sibling.join("keep.bin")).unwrap(), b"unrelated");
    }
}

#[cfg(windows)]
#[test]
fn saf02_restart_exposes_cache_left_after_partial_locked_removal() {
    use std::os::windows::fs::OpenOptionsExt;
    let root = TestRoot::new();
    let package = package_root(&root.0);
    let cache = profile_root(&root.0).join("cache");
    fs::create_dir_all(&package).unwrap();
    fs::write(package.join("owned.bin"), b"synthetic package").unwrap();
    fs::create_dir_all(&cache).unwrap();
    let locked_path = cache.join("locked.bin");
    fs::write(&locked_path, b"synthetic cache").unwrap();
    let lock = fs::OpenOptions::new()
        .read(true)
        .share_mode(0)
        .open(&locked_path)
        .unwrap();
    let manager = OptionalChatterboxManager::default();
    let removal = manager.remove_at(&root.0);
    let package_removed = !package.exists();
    let restarted = OptionalChatterboxManager::default();
    let discovered = restarted.snapshot_at(&root.0).unwrap();
    drop(lock);
    let retry = restarted.remove_at(&root.0).unwrap();
    assert_eq!(removal, Err(OptionalProfileError::CleanupFailed));
    assert!(package_removed);
    assert_eq!(discovered.state, OptionalProfileState::Failed);
    assert_eq!(discovered.failure, Some("tts-optional-profile-unavailable"));
    assert_eq!(retry.state, OptionalProfileState::Absent);
    assert!(!cache.exists());
}

#[test]
fn saf02_denied_cache_metadata_remains_discoverable_and_fails_closed() {
    let root = TestRoot::new();
    let cache = profile_root(&root.0).join("cache");
    VCA_DENIED_METADATA.with(|slot| *slot.borrow_mut() = Some(cache.clone()));
    let manager = OptionalChatterboxManager::default();
    let discovered = manager.snapshot_at(&root.0).unwrap().state;
    let removed = manager.remove_at(&root.0);
    VCA_DENIED_METADATA.with(|slot| *slot.borrow_mut() = None);
    assert_eq!(discovered, OptionalProfileState::Failed);
    assert_eq!(removed, Err(OptionalProfileError::VerificationFailed));
    assert_eq!(
        OptionalChatterboxManager::default()
            .snapshot_at(&root.0)
            .unwrap()
            .state,
        OptionalProfileState::Absent
    );
}

#[cfg(windows)]
#[test]
fn vaf_cancelled_request_before_headers_preserves_diagnostic_and_cleans_staging() {
    for cancel in [false, true] {
        let root = TestRoot::new();
        let manager = Arc::new(OptionalChatterboxManager::default());
        manager.set_operation(OptionalProfileState::Confirming, 0, None, None);
        DownloadAttempt::new(
            &manager.last_download_error,
            DownloadSource::GithubRelease,
            1,
            100,
        )
        .fail(
            DownloadStage::Request,
            DownloadFailureKind::InvalidUrl,
            None,
        );
        let previous = *manager.last_download_error.lock().unwrap();
        let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        let address = listener.local_addr().unwrap();
        let cancelling_manager = Arc::clone(&manager);
        let cancelling_root = root.0.clone();
        let server = thread::spawn(move || {
            let (mut stream, _) = listener.accept().unwrap();
            stream
                .set_read_timeout(Some(Duration::from_secs(5)))
                .unwrap();
            let mut request = [0_u8; 1024];
            assert!(stream.read(&mut request).unwrap() > 0);
            if cancel {
                cancelling_manager.cancel_at(&cancelling_root).unwrap();
            }
            // Close before any headers: the real pending send returns an error.
            stream.shutdown(std::net::Shutdown::Both).unwrap();
        });
        let downloading_manager = Arc::clone(&manager);
        DOWNLOAD_HOOK.with(|slot| {
            *slot.borrow_mut() = Some(Box::new(move |_destination, cancelled| {
                let client = reqwest::Client::builder()
                    .no_proxy()
                    .timeout(Duration::from_secs(5))
                    .build()
                    .unwrap();
                send_download_request(
                    client.get(format!("http://{address}/")),
                    cancelled,
                    &DownloadAttempt::new(
                        &downloading_manager.last_download_error,
                        DownloadSource::GithubRelease,
                        1,
                        100,
                    ),
                    &downloading_manager.transfer_abort,
                )
                .map(|_| ())
            }));
        });
        let result = manager.download_at(&root.0);
        server.join().unwrap();
        assert!(!manager.operation.lock().unwrap().worker_active);
        assert!(!staging_root(&root.0).exists());
        if cancel {
            assert_eq!(result.unwrap().state, OptionalProfileState::Absent);
            assert_eq!(*manager.last_download_error.lock().unwrap(), previous);
        } else {
            assert_eq!(result, Err(OptionalProfileError::DownloadFailed));
            let diagnostic = manager.last_download_error.lock().unwrap().unwrap();
            assert_eq!(diagnostic.stage, DownloadStage::Request);
            assert_eq!(diagnostic.kind, DownloadFailureKind::Request);
        }
    }
}

#[cfg(windows)]
#[test]
fn sac02_cancelled_blocked_response_read_preserves_diagnostic_and_cleans_staging() {
    for cancel in [false, true] {
        let root = TestRoot::new();
        let manager = Arc::new(OptionalChatterboxManager::default());
        manager.set_operation(OptionalProfileState::Confirming, 0, None, None);
        DownloadAttempt::new(
            &manager.last_download_error,
            DownloadSource::GithubRelease,
            1,
            100,
        )
        .fail(
            DownloadStage::Request,
            DownloadFailureKind::InvalidUrl,
            None,
        );
        let previous = *manager.last_download_error.lock().unwrap();
        let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        let address = listener.local_addr().unwrap();
        let (release, released) = std::sync::mpsc::channel();
        let server = thread::spawn(move || {
            let (mut stream, _) = listener.accept().unwrap();
            let mut request = [0_u8; 1024];
            assert!(stream.read(&mut request).unwrap() > 0);
            stream
                .write_all(b"HTTP/1.1 200 OK\r\nContent-Length: 100\r\n\r\nx")
                .unwrap();
            let _ = released.recv_timeout(Duration::from_secs(5));
        });
        let (reading, read_started) = std::sync::mpsc::channel();
        let cancelling_manager = Arc::clone(&manager);
        let cancelling_root = root.0.clone();
        let cancelling = thread::spawn(move || {
            read_started.recv_timeout(Duration::from_secs(5)).unwrap();
            // The first byte is already consumed. The next HTTP read blocks
            // until the client's bounded timeout, after cancellation is requested.
            thread::sleep(Duration::from_millis(30));
            if cancel {
                cancelling_manager.cancel_at(&cancelling_root).unwrap();
            }
        });
        let downloading_manager = Arc::clone(&manager);
        DOWNLOAD_HOOK.with(|slot| {
            *slot.borrow_mut() = Some(Box::new(move |destination, cancelled| {
                let client = reqwest::Client::builder()
                    .no_proxy()
                    .timeout(Duration::from_millis(500))
                    .build()
                    .unwrap();
                let attempt = DownloadAttempt::new(
                    &downloading_manager.last_download_error,
                    DownloadSource::GithubRelease,
                    1,
                    100,
                );
                let response = send_download_request(
                    client.get(format!("http://{address}/")),
                    cancelled,
                    &attempt,
                    &downloading_manager.transfer_abort,
                )?;
                let mut artifact = runtime_artifact("0".repeat(64)).parts.remove(0);
                artifact.download_bytes = 100;
                copy_download_response(
                    &artifact,
                    response,
                    destination,
                    cancelled,
                    |_| {
                        let _ = reading.send(());
                    },
                    DownloadAttempt::new(
                        &downloading_manager.last_download_error,
                        DownloadSource::GithubRelease,
                        1,
                        100,
                    ),
                )
            }));
        });
        let result = manager.download_at(&root.0);
        cancelling.join().unwrap();
        release.send(()).unwrap();
        server.join().unwrap();
        assert!(!manager.operation.lock().unwrap().worker_active);
        assert!(!staging_root(&root.0).exists());
        if cancel {
            assert_eq!(result.unwrap().state, OptionalProfileState::Absent);
            assert_eq!(*manager.last_download_error.lock().unwrap(), previous);
        } else {
            assert_eq!(result, Err(OptionalProfileError::DownloadFailed));
            let diagnostic = manager.last_download_error.lock().unwrap().unwrap();
            assert_eq!(diagnostic.stage, DownloadStage::Read);
            assert_eq!(diagnostic.kind, DownloadFailureKind::Timeout);
            assert_eq!(diagnostic.received_bytes, 1);
        }
    }
}

#[test]
fn download_diagnostic_classifies_a_real_response_read_timeout() {
    let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
    let address = listener.local_addr().unwrap();
    let (release, released) = std::sync::mpsc::channel();
    let server = thread::spawn(move || {
        let (mut stream, _) = listener.accept().unwrap();
        let mut request = [0_u8; 1024];
        assert!(stream.read(&mut request).unwrap() > 0);
        stream
            .write_all(b"HTTP/1.1 200 OK\r\nContent-Length: 100\r\n\r\nx")
            .unwrap();
        let _ = released.recv_timeout(Duration::from_secs(5));
    });
    let client = reqwest::blocking::Client::builder()
        .no_proxy()
        .timeout(Duration::from_millis(200))
        .build()
        .unwrap();
    let mut response = client.get(format!("http://{address}/")).send().unwrap();
    let slot = Mutex::new(None);
    let mut attempt = DownloadAttempt::new(&slot, DownloadSource::GithubRelease, 1, 100);
    attempt
        .response(response.status(), response.content_length())
        .unwrap();
    let mut first_byte = [0_u8; 1];
    response.read_exact(&mut first_byte).unwrap();
    let error = response.read(&mut first_byte).unwrap_err();
    release.send(()).unwrap();
    server.join().unwrap();

    attempt.received(1);
    attempt.fail(DownloadStage::Read, DownloadFailureKind::Io, Some(&error));
    let report = slot.lock().unwrap().unwrap();
    assert_eq!(report.kind, DownloadFailureKind::Timeout);
    assert_eq!(report.received_bytes, 1);
    assert_eq!(report.http_status, Some(200));
    assert!(
        !serde_json::to_string(&report)
            .unwrap()
            .contains("127.0.0.1")
    );
}

#[test]
fn download_diagnostic_distinguishes_http_and_length_failures() {
    let slot = Mutex::new(None);
    let mut attempt = DownloadAttempt::new(&slot, DownloadSource::GithubRelease, 1, 100);
    assert_eq!(
        attempt.response(reqwest::StatusCode::TOO_MANY_REQUESTS, Some(20)),
        Err(OptionalProfileError::DownloadFailed)
    );
    let first = slot.lock().unwrap().unwrap();
    assert_eq!(first.kind, DownloadFailureKind::HttpStatus);
    assert_eq!(first.http_status, Some(429));
    assert_eq!(
        attempt.response(reqwest::StatusCode::OK, Some(u64::MAX)),
        Err(OptionalProfileError::DownloadFailed)
    );
    let second = slot.lock().unwrap().unwrap();
    assert_eq!(second.kind, DownloadFailureKind::ContentLength);
    assert_eq!(
        serde_json::to_value(second).unwrap()["contentLength"],
        u64::MAX.to_string()
    );
    attempt
        .response(reqwest::StatusCode::OK, Some(100))
        .unwrap();
    assert_eq!(*slot.lock().unwrap(), Some(second));
}

#[test]
fn download_diagnostic_is_one_memory_only_record_independent_of_cleanup() {
    let manager = OptionalChatterboxManager::default();
    assert!(manager.last_download_error.lock().unwrap().is_none());
    let mut attempt = DownloadAttempt::new(
        &manager.last_download_error,
        DownloadSource::HuggingFace,
        2,
        100,
    );
    attempt.received(17);
    let private = std::io::Error::new(
        std::io::ErrorKind::TimedOut,
        "C:/private/book.epub https://host/?token=secret",
    );
    attempt.fail(DownloadStage::Read, DownloadFailureKind::Io, Some(&private));
    let first = manager.last_download_error.lock().unwrap().unwrap();
    assert_eq!(first.kind, DownloadFailureKind::Timeout);
    assert_eq!(first.received_bytes, 17);
    let json = serde_json::to_string(&first).unwrap();
    for forbidden in ["private", "secret", "https://", "epub"] {
        assert!(!json.contains(forbidden));
    }
    assert!(json.len() < 1_024);
    manager.set_operation(
        OptionalProfileState::Failed,
        0,
        Some(OptionalProfileError::CleanupFailed.code()),
        None,
    );
    manager.clear_operation();
    assert_eq!(*manager.last_download_error.lock().unwrap(), Some(first));
    attempt.fail(
        DownloadStage::Write,
        DownloadFailureKind::Io,
        Some(&std::io::Error::from_raw_os_error(5)),
    );
    let second = manager.last_download_error.lock().unwrap().unwrap();
    assert_eq!(second.os_error, Some(5));
    assert_eq!(second.stage, DownloadStage::Write);
    assert!(
        OptionalChatterboxManager::default()
            .last_download_error
            .lock()
            .unwrap()
            .is_none()
    );
}

#[test]
fn download_diagnostic_records_real_rejection_but_not_cancellation() {
    let root = TestRoot::new();
    let slot = Mutex::new(None);
    let mut part = runtime_artifact("0".repeat(64)).parts.remove(0);
    part.url = "https://unapproved.example/private?secret=token".to_owned();
    let cancelled = AtomicBool::new(false);
    assert_eq!(
        download_artifact(
            &part,
            DownloadSource::GithubRelease,
            2,
            &root.0.join("part"),
            (&cancelled, &TransferAbort::default()),
            |_| {},
            DownloadAttempt::new(&slot, DownloadSource::GithubRelease, 1, 10)
        ),
        Err(OptionalProfileError::DownloadFailed)
    );
    let rejection = slot.lock().unwrap().unwrap();
    assert_eq!(rejection.kind, DownloadFailureKind::RedirectRejected);
    DOWNLOAD_HOOK.with(|hook| {
        *hook.borrow_mut() = Some(Box::new(|_, _| Err(OptionalProfileError::Cancelled)))
    });
    assert_eq!(
        download_artifact(
            &part,
            DownloadSource::GithubRelease,
            2,
            &root.0.join("part"),
            (&cancelled, &TransferAbort::default()),
            |_| {},
            DownloadAttempt::new(&slot, DownloadSource::GithubRelease, 1, 10)
        ),
        Err(OptionalProfileError::Cancelled)
    );
    assert_eq!(*slot.lock().unwrap(), Some(rejection));
    assert_eq!(fs::read_dir(&root.0).unwrap().count(), 0);
}

#[test]
#[ignore = "explicit read-only Windows host diagnostic; requires an installed package"]
#[cfg(windows)]
fn installed_host_integrity_diagnostic() {
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn GetCurrentPackageFullName(length: *mut u32, name: *mut u16) -> i32;
    }
    let mut length = 0;
    // A packaged launcher can merge its private MSIX view into LOCALAPPDATA.
    // The installed-host gate must inspect the ordinary user's actual tree.
    assert_eq!(
        unsafe { GetCurrentPackageFullName(&mut length, std::ptr::null_mut()) },
        15700,
        "run from an unpackaged local PowerShell session"
    );
    let root = PathBuf::from(std::env::var_os("LOCALAPPDATA").expect("LOCALAPPDATA"))
        .join("com.voxleaf.desktop/tts");
    let authority = exact_manifest().expect("authority");
    let package = package_root(&root);
    eprintln!("installed-integrity:canonical-root");
    let canonical = canonical_contained_directory(&root, &package).expect("canonical-root");
    eprintln!("installed-integrity:tree-stamp");
    runtime_tree_stamp(&package, &canonical).expect("tree-stamp");
    eprintln!("installed-integrity:bytecode-authority");
    runtime_manifest_for_bytecode_cleanup(&package, &authority).expect("bytecode-authority");
    eprintln!("installed-integrity:verify-runtime");
    verify_runtime(&package, &authority).expect("verify-runtime");
    eprintln!("installed-integrity:passed");
}

type DownloadHook = Box<dyn FnOnce(&Path, &AtomicBool) -> Result<(), OptionalProfileError>>;
thread_local! {
    static MAF_DISCOVERY_INPUTS: std::cell::RefCell<Option<(PathBuf, OptionalPackageManifest)>> = const { std::cell::RefCell::new(None) };
    static MAF_AFTER_SERVICE_STOP: std::cell::RefCell<Option<Box<dyn FnOnce()>>> = const { std::cell::RefCell::new(None) };
    static SNAPSHOT_IDLE_HOOK: std::cell::RefCell<Option<Box<dyn FnOnce()>>> = const { std::cell::RefCell::new(None) };
    static HASH_HOOK: std::cell::RefCell<Option<Box<dyn FnOnce()>>> = const { std::cell::RefCell::new(None) };
    static BEFORE_COMMIT_HOOK: std::cell::RefCell<Option<Box<dyn FnOnce()>>> = const { std::cell::RefCell::new(None) };
    static AFTER_COMMIT_HOOK: std::cell::RefCell<Option<Box<dyn FnOnce()>>> = const { std::cell::RefCell::new(None) };
    static DOWNLOAD_HOOK: std::cell::RefCell<Option<DownloadHook>> = const { std::cell::RefCell::new(None) };
    static CLEANUP_LOCK: std::cell::RefCell<Option<File>> = const { std::cell::RefCell::new(None) };
}

pub(super) fn maf_discovery_inputs() -> Option<(PathBuf, OptionalPackageManifest)> {
    MAF_DISCOVERY_INPUTS.with(|slot| slot.borrow().clone())
}

pub(super) fn maf_after_service_stop() {
    if let Some(hook) = MAF_AFTER_SERVICE_STOP.with(|slot| slot.borrow_mut().take()) {
        hook();
    }
}

struct MafDiscoveryGuard;

impl Drop for MafDiscoveryGuard {
    fn drop(&mut self) {
        MAF_DISCOVERY_INPUTS.with(|slot| slot.borrow_mut().take());
        MAF_AFTER_SERVICE_STOP.with(|slot| slot.borrow_mut().take());
    }
}

#[cfg(windows)]
#[test]
fn maf_04_removal_excludes_verified_configuration_and_real_spawn() {
    let root = TestRoot::new();
    let package = package_root(&root.0);
    let authority = write_runtime(&package);
    let _guard = MafDiscoveryGuard;
    MAF_DISCOVERY_INPUTS.with(|slot| *slot.borrow_mut() = Some((root.0.clone(), authority)));
    let supervisor = Arc::new(crate::tts_service_supervisor::TtsServiceSupervisor::default());
    let (stopped, observed_stop) = std::sync::mpsc::sync_channel(1);
    let (release, released) = std::sync::mpsc::sync_channel(1);
    let removing_supervisor = Arc::clone(&supervisor);
    let removing_root = root.0.clone();
    let removing = thread::spawn(move || {
        let _guard = MafDiscoveryGuard;
        MAF_AFTER_SERVICE_STOP.with(|slot| {
            *slot.borrow_mut() = Some(Box::new(move || {
                stopped.send(()).unwrap();
                released.recv_timeout(Duration::from_secs(15)).unwrap();
            }))
        });
        OptionalChatterboxManager::default()
            .remove_after_service_stop(&removing_root, &removing_supervisor)
    });
    observed_stop.recv_timeout(Duration::from_secs(15)).unwrap();
    // The package still exists: this ordering can genuinely launch a child.
    assert!(package.join("runtime/python.exe").is_file());
    let configured = supervisor.maf_configure_installed();
    let (started, published) = supervisor.maf_start_and_contain_installed();
    release.send(()).unwrap();
    let removed = removing.join().unwrap();
    assert!(removed.is_ok());
    assert!(!package.exists());
    assert_eq!(
        configured,
        Err(crate::tts_service_protocol::TtsNativeFailure::Busy)
    );
    assert_eq!(
        started,
        Err(crate::tts_service_protocol::TtsNativeFailure::Busy)
    );
    assert!(!published);
}

#[test]
fn maf_04_removal_revokes_previously_verified_configuration() {
    let root = TestRoot::new();
    let package = package_root(&root.0);
    let authority = write_runtime(&package);
    let _guard = MafDiscoveryGuard;
    MAF_DISCOVERY_INPUTS.with(|slot| *slot.borrow_mut() = Some((root.0.clone(), authority)));
    let supervisor = crate::tts_service_supervisor::TtsServiceSupervisor::default();
    supervisor.maf_configure_installed().unwrap();
    assert!(supervisor.maf_has_installed_configuration());
    OptionalChatterboxManager::default()
        .remove_after_service_stop(&root.0, &supervisor)
        .unwrap();
    assert!(!package.exists());
    // This tests revocation, not a fabricated spawn from a deleted executable.
    assert!(!supervisor.maf_has_installed_configuration());
}

#[cfg(windows)]
#[test]
fn maf_04_published_start_remains_interruptible_before_handshake() {
    let root = TestRoot::new();
    let authority = write_runtime(&package_root(&root.0));
    let _guard = MafDiscoveryGuard;
    MAF_DISCOVERY_INPUTS.with(|slot| *slot.borrow_mut() = Some((root.0.clone(), authority)));
    let supervisor = Arc::new(crate::tts_service_supervisor::TtsServiceSupervisor::default());
    supervisor.maf_configure_installed().unwrap();
    let (started, published) = supervisor.maf_start_and_contain_installed();
    assert!(published);
    assert!(started.is_err());
    assert!(!supervisor.maf_has_installed_configuration());
}

pub(super) fn run_snapshot_idle_hook() {
    let hook = SNAPSHOT_IDLE_HOOK.with(|slot| slot.borrow_mut().take());
    if let Some(hook) = hook {
        hook();
    }
}

// The real download owner uses the Windows-only free-space admission probe.
#[cfg(windows)]
#[test]
fn lcf_snapshot_preserves_concurrently_admitted_download_staging() {
    let root = TestRoot::new();
    let manager = Arc::new(OptionalChatterboxManager::default());
    let (idle, observed_idle) = std::sync::mpsc::channel();
    let (resume, resumed) = std::sync::mpsc::channel();
    let snapshot_manager = Arc::clone(&manager);
    let snapshot_root = root.0.clone();
    let snapshot = thread::spawn(move || {
        SNAPSHOT_IDLE_HOOK.with(|slot| {
            *slot.borrow_mut() = Some(Box::new(move || {
                idle.send(()).unwrap();
                resumed.recv_timeout(Duration::from_secs(10)).unwrap();
            }))
        });
        snapshot_manager.snapshot_at(&snapshot_root)
    });
    observed_idle.recv_timeout(Duration::from_secs(10)).unwrap();
    manager.select_at(&root.0).unwrap();
    let (staged, observed_staging) = std::sync::mpsc::channel();
    let (finish, finished) = std::sync::mpsc::channel();
    let download_manager = Arc::clone(&manager);
    let download_root = root.0.clone();
    let download = thread::spawn(move || {
        DOWNLOAD_HOOK.with(|slot| {
            *slot.borrow_mut() = Some(Box::new(move |destination, cancelled| {
                fs::write(destination, b"synthetic in-flight bytes").unwrap();
                staged.send(destination.to_path_buf()).unwrap();
                let _ = finished.recv_timeout(Duration::from_secs(10));
                assert!(cancelled.load(Ordering::Acquire));
                Err(OptionalProfileError::Cancelled)
            }))
        });
        download_manager.download_at(&download_root)
    });
    let sentinel = observed_staging
        .recv_timeout(Duration::from_secs(10))
        .unwrap();
    let cancellation = manager
        .operation
        .lock()
        .unwrap()
        .cancellation
        .clone()
        .unwrap();
    resume.send(()).unwrap();
    let result = snapshot.join().unwrap();
    let bytes = fs::read(sentinel);
    let same_owner = manager
        .operation
        .lock()
        .unwrap()
        .cancellation
        .as_ref()
        .is_some_and(|signal| Arc::ptr_eq(signal, &cancellation));
    manager.cancel_at(&root.0).unwrap();
    finish.send(()).unwrap();
    let downloaded = download.join().unwrap();
    assert_eq!(bytes.unwrap(), b"synthetic in-flight bytes");
    assert_eq!(result.unwrap().state, OptionalProfileState::Downloading);
    assert!(same_owner);
    assert!(cancellation.load(Ordering::Acquire));
    assert_eq!(downloaded.unwrap().state, OptionalProfileState::Absent);
    assert!(!staging_root(&root.0).exists());
    assert!(!manager.operation.lock().unwrap().worker_active);
}

pub(super) fn run_hash_hook() {
    let hook = HASH_HOOK.with(|slot| slot.borrow_mut().take());
    if let Some(hook) = hook {
        hook();
    }
}

pub(super) fn run_before_commit_hook() {
    let hook = BEFORE_COMMIT_HOOK.with(|slot| slot.borrow_mut().take());
    if let Some(hook) = hook {
        hook();
    }
}

pub(super) fn run_after_commit_hook() {
    let hook = AFTER_COMMIT_HOOK.with(|slot| slot.borrow_mut().take());
    if let Some(hook) = hook {
        hook();
    }
}

#[test]
fn b06_cancellation_and_commit_have_one_winner() {
    for cancel_before in [true, false] {
        let root = TestRoot::new();
        let staging = staging_root(&root.0).join("operation/package");
        let authority = write_runtime(&staging);
        let manager = Arc::new(OptionalChatterboxManager::default());
        let cancellation = Arc::new(AtomicBool::new(false));
        manager.set_operation(
            OptionalProfileState::Verifying,
            0,
            None,
            Some(Arc::clone(&cancellation)),
        );
        let callback_manager = Arc::clone(&manager);
        let callback_root = root.0.clone();
        let hook: Box<dyn FnOnce()> = Box::new(move || {
            let outcome = callback_manager.cancel_at(&callback_root).unwrap();
            assert_eq!(
                outcome.state,
                if cancel_before {
                    OptionalProfileState::Verifying
                } else {
                    OptionalProfileState::Installed
                }
            );
            assert_eq!(
                callback_manager.remove_at(&callback_root),
                Err(OptionalProfileError::Busy)
            );
        });
        if cancel_before {
            BEFORE_COMMIT_HOOK.with(|slot| *slot.borrow_mut() = Some(hook));
        } else {
            AFTER_COMMIT_HOOK.with(|slot| *slot.borrow_mut() = Some(hook));
        }
        let result = with_installed_runtime_lock(|| {
            promote(
                &root.0,
                &staging,
                &authority,
                Some((&manager, &cancellation)),
            )
        });
        assert_eq!(
            result,
            if cancel_before {
                Err(OptionalProfileError::Cancelled)
            } else {
                Ok(())
            }
        );
        assert_eq!(package_root(&root.0).exists(), !cancel_before);
        assert_eq!(cancellation.load(Ordering::Acquire), cancel_before);
    }
}

#[test]
fn b06_cancel_does_not_wait_for_installed_runtime_lock() {
    let root = TestRoot::new();
    let staging = staging_root(&root.0).join("operation/package");
    let authority = write_runtime(&staging);
    let manager = OptionalChatterboxManager::default();
    let cancellation = Arc::new(AtomicBool::new(false));
    manager.set_operation(
        OptionalProfileState::Verifying,
        0,
        None,
        Some(Arc::clone(&cancellation)),
    );
    with_installed_runtime_lock(|| {
        let snapshot = manager.cancel_at(&root.0)?;
        assert_eq!(snapshot.state, OptionalProfileState::Verifying);
        assert!(cancellation.load(Ordering::Acquire));
        // This is the same post-lock entry used by the acquisition worker.
        assert_eq!(
            promote(
                &root.0,
                &staging,
                &authority,
                Some((&manager, &cancellation))
            ),
            Err(OptionalProfileError::Cancelled)
        );
        Ok(())
    })
    .unwrap();
    assert!(!package_root(&root.0).exists());
}

pub(super) fn run_download_hook(
    destination: &Path,
    cancelled: &AtomicBool,
) -> Option<Result<(), OptionalProfileError>> {
    let hook = DOWNLOAD_HOOK.with(|slot| slot.borrow_mut().take());
    hook.map(|hook| hook(destination, cancelled))
}

#[test]
fn b06_cancellation_accepted_during_final_hashing_prevents_promotion() {
    let root = TestRoot::new();
    let staging = staging_root(&root.0).join("operation/package");
    let authority = write_runtime(&staging);
    let installed = package_root(&root.0);
    fs::create_dir_all(&installed).unwrap();
    fs::write(installed.join("previous-marker"), b"previous installation").unwrap();
    let manager = Arc::new(OptionalChatterboxManager::default());
    let cancellation = Arc::new(AtomicBool::new(false));
    manager.set_operation(
        OptionalProfileState::Verifying,
        0,
        None,
        Some(Arc::clone(&cancellation)),
    );
    let cancelling_manager = Arc::clone(&manager);
    let cancelling_root = root.0.clone();
    HASH_HOOK.with(|slot| {
        *slot.borrow_mut() = Some(Box::new(move || {
            assert_eq!(
                cancelling_manager
                    .cancel_at(&cancelling_root)
                    .unwrap()
                    .state,
                OptionalProfileState::Verifying
            );
        }))
    });
    let result = with_installed_runtime_lock(|| {
        promote(
            &root.0,
            &staging,
            &authority,
            Some((&manager, &cancellation)),
        )
    });
    assert!(cancellation.load(Ordering::Acquire));
    assert_eq!(result, Err(OptionalProfileError::Cancelled));
    assert_eq!(
        fs::read(installed.join("previous-marker")).unwrap(),
        b"previous installation"
    );
    assert!(staging.exists());
}

#[cfg(windows)]
#[test]
fn b07_cancelled_worker_settles_even_when_staging_cleanup_fails() {
    use std::os::windows::fs::OpenOptionsExt;
    let root = TestRoot::new();
    let manager = OptionalChatterboxManager::default();
    manager.set_operation(OptionalProfileState::Confirming, 0, None, None);
    DOWNLOAD_HOOK.with(|slot| {
        *slot.borrow_mut() = Some(Box::new(|destination, cancelled| {
            fs::write(destination, b"synthetic partial transfer").unwrap();
            let lock = fs::OpenOptions::new()
                .read(true)
                .share_mode(0)
                .open(destination)
                .unwrap();
            CLEANUP_LOCK.with(|slot| *slot.borrow_mut() = Some(lock));
            cancelled.store(true, Ordering::Release);
            Err(OptionalProfileError::Cancelled)
        }))
    });
    let result = manager.download_at(&root.0);
    CLEANUP_LOCK.with(|slot| *slot.borrow_mut() = None);
    assert_eq!(result, Err(OptionalProfileError::CleanupFailed));
    let snapshot = manager.snapshot_at(&root.0).unwrap();
    assert_eq!(snapshot.state, OptionalProfileState::Failed);
    assert_eq!(
        snapshot.failure,
        Some(OptionalProfileError::CleanupFailed.code())
    );
    assert!(manager.operation.lock().unwrap().cancellation.is_none());
    assert_eq!(
        manager.remove_at(&root.0).unwrap().state,
        OptionalProfileState::Absent
    );
    assert!(!staging_root(&root.0).exists());
}

#[test]
fn reselection_preserves_busy_operation_and_worker_cancellation() {
    for state in [
        OptionalProfileState::Downloading,
        OptionalProfileState::Verifying,
        OptionalProfileState::Removing,
    ] {
        let root = TestRoot::new();
        let manager = OptionalChatterboxManager::default();
        let signal = Arc::new(AtomicBool::new(false));
        manager.set_operation(state.clone(), 1024, None, Some(Arc::clone(&signal)));
        let selected = select_at_if_host_admitted(&manager, &root.0, true).unwrap();
        assert_eq!(selected.state, state);
        assert_eq!(selected.downloaded_bytes, 1024);
        assert!(Arc::ptr_eq(
            manager
                .operation
                .lock()
                .unwrap()
                .cancellation
                .as_ref()
                .unwrap(),
            &signal,
        ));
        if state != OptionalProfileState::Removing {
            manager.cancel_at(&root.0).unwrap();
            assert!(signal.load(Ordering::Acquire));
        }
    }
}

#[test]
fn b07_confirmation_cancel_reserves_cleanup_against_concurrent_commands() {
    let root = TestRoot::new();
    let manager = Arc::new(OptionalChatterboxManager::default());
    manager.set_operation(OptionalProfileState::Confirming, 0, None, None);
    let worker = with_installed_runtime_lock(|| {
        let cancelling = Arc::clone(&manager);
        let cancelling_root = root.0.clone();
        let worker = thread::spawn(move || cancelling.cancel_at(&cancelling_root));
        let deadline = std::time::Instant::now() + std::time::Duration::from_secs(5);
        loop {
            if manager.operation.lock().unwrap().state == Some(OptionalProfileState::Removing) {
                break;
            }
            assert!(std::time::Instant::now() < deadline);
            thread::yield_now();
        }
        assert_eq!(
            manager.snapshot_at(&root.0)?.state,
            OptionalProfileState::Removing
        );
        assert_eq!(
            manager.select_at(&root.0)?.state,
            OptionalProfileState::Removing
        );
        assert_eq!(
            manager.download_at(&root.0),
            Err(OptionalProfileError::Invalid)
        );
        assert_eq!(manager.remove_at(&root.0), Err(OptionalProfileError::Busy));
        Ok(worker)
    })
    .unwrap();
    assert_eq!(
        worker.join().unwrap().unwrap().state,
        OptionalProfileState::Absent
    );
    assert!(!manager.operation.lock().unwrap().worker_active);
}

#[cfg(windows)]
#[test]
fn b07_confirmation_cleanup_failure_settles_and_can_be_retried() {
    use std::os::windows::fs::OpenOptionsExt;
    let root = TestRoot::new();
    let staging = staging_root(&root.0).join("operation");
    fs::create_dir_all(&staging).unwrap();
    let file = staging.join("synthetic.partial");
    fs::write(&file, b"partial").unwrap();
    let locked = fs::OpenOptions::new()
        .read(true)
        .share_mode(0)
        .open(file)
        .unwrap();
    let manager = OptionalChatterboxManager::default();
    manager.set_operation(OptionalProfileState::Confirming, 0, None, None);
    assert_eq!(
        manager.cancel_at(&root.0),
        Err(OptionalProfileError::CleanupFailed)
    );
    assert_eq!(
        manager.snapshot_at(&root.0).unwrap().state,
        OptionalProfileState::Failed
    );
    assert!(!manager.operation.lock().unwrap().worker_active);
    drop(locked);
    assert_eq!(
        manager.select_at(&root.0).unwrap().state,
        OptionalProfileState::Confirming
    );
    assert_eq!(
        manager.cancel_at(&root.0).unwrap().state,
        OptionalProfileState::Absent
    );
    assert!(!staging_root(&root.0).exists());
}

#[test]
fn removal_failure_is_reported_and_can_be_retried_after_repair() {
    let root = TestRoot::new();
    let package = package_root(&root.0);
    fs::create_dir_all(package.parent().unwrap()).unwrap();
    fs::write(&package, b"synthetic invalid directory").unwrap();
    let manager = OptionalChatterboxManager::default();
    assert_eq!(
        manager.remove_at(&root.0),
        Err(OptionalProfileError::VerificationFailed)
    );
    let failed = manager.snapshot_at(&root.0).unwrap();
    assert_eq!(failed.state, OptionalProfileState::Failed);
    assert_eq!(
        failed.failure,
        Some(OptionalProfileError::VerificationFailed.code())
    );
    fs::remove_file(&package).unwrap();
    assert_eq!(
        manager.remove_at(&root.0).unwrap().state,
        OptionalProfileState::Absent
    );
}

#[test]
fn maf_04_removal_stops_before_deletion_when_termination_is_unverified() {
    let root = TestRoot::new();
    let package = package_root(&root.0);
    fs::create_dir_all(&package).unwrap();
    let sentinel = package.join("synthetic.bin");
    fs::write(&sentinel, b"owned package").unwrap();
    let manager = OptionalChatterboxManager::default();
    let supervisor =
        crate::tts_service_supervisor::TtsServiceSupervisor::lcf_unverified_termination_fixture();
    let result = manager.remove_after_service_stop(&root.0, &supervisor);
    let bytes = fs::read(&sentinel);
    assert_eq!(result, Err(OptionalProfileError::CleanupFailed));
    assert_eq!(bytes.unwrap(), b"owned package");
    assert!(manager.operation.lock().unwrap().state.is_none());
    supervisor.lcf_repair_termination_fixture();
    assert_eq!(
        manager
            .remove_after_service_stop(&root.0, &supervisor)
            .unwrap()
            .state,
        OptionalProfileState::Absent
    );
    assert!(!package.exists());
}

#[test]
fn clb05_backup_only_is_discoverable_and_explicitly_removed() {
    let root = TestRoot::new();
    let backup = root.0.join("cb/.previous");
    fs::create_dir_all(&backup).unwrap();
    fs::write(backup.join("owned.bin"), b"synthetic backup").unwrap();
    let unrelated = root.0.join("cb/99");
    fs::create_dir_all(&unrelated).unwrap();
    fs::write(unrelated.join("keep.bin"), b"unrelated").unwrap();
    let manager = OptionalChatterboxManager::default();
    assert_eq!(
        manager.snapshot_at(&root.0).unwrap().state,
        OptionalProfileState::Failed
    );
    assert_eq!(
        manager.remove_at(&root.0).unwrap().state,
        OptionalProfileState::Absent
    );
    assert!(!backup.exists());
    assert_eq!(fs::read(unrelated.join("keep.bin")).unwrap(), b"unrelated");
}

#[cfg(windows)]
#[test]
fn clb05_failed_promotion_cleanup_leaves_removable_owned_backup() {
    use std::os::windows::fs::OpenOptionsExt;
    let root = TestRoot::new();
    let staging = staging_root(&root.0).join("operation/package");
    let authority = write_runtime(&staging);
    let active = package_root(&root.0);
    fs::create_dir_all(&active).unwrap();
    fs::write(active.join("old.bin"), b"synthetic old package").unwrap();
    let backup = promotion_backup_root(&root.0);
    let lock_path = backup.join("old.bin");
    AFTER_COMMIT_HOOK.with(|slot| {
        *slot.borrow_mut() = Some(Box::new(move || {
            CLEANUP_LOCK.with(|lock| {
                *lock.borrow_mut() = Some(
                    fs::OpenOptions::new()
                        .read(true)
                        .share_mode(0)
                        .open(&lock_path)
                        .unwrap(),
                )
            });
        }))
    });
    let result = promote(&root.0, &staging, &authority, None);
    CLEANUP_LOCK.with(|slot| slot.borrow_mut().take());
    assert_eq!(result, Err(OptionalProfileError::CleanupFailed));
    assert!(backup.join("old.bin").exists());
    assert!(active.join("runtime/python.exe").exists());
    let restarted = OptionalChatterboxManager::default();
    restarted.remove_with_manifest(&root.0, &authority).unwrap();
    assert!(!backup.exists());
    assert!(!active.exists());
}

#[cfg(windows)]
#[test]
fn clb05_backup_junctions_are_retained_without_touching_external_files() {
    for relative in ["cb", "cb/.previous", "cb/.previous/nested"] {
        let root = TestRoot::new();
        let external = TestRoot::new();
        fs::write(external.0.join("keep.bin"), b"outside").unwrap();
        fs::create_dir_all(external.0.join(".previous")).unwrap();
        let link = root.0.join(relative);
        fs::create_dir_all(link.parent().unwrap()).unwrap();
        let status = std::process::Command::new("powershell.exe")
            .args(["-NoProfile", "-NonInteractive", "-Command", "New-Item -ItemType Junction -Path $env:VOXLEAF_TEST_LINK -Target $env:VOXLEAF_TEST_TARGET -ErrorAction Stop | Out-Null"])
            .env("VOXLEAF_TEST_LINK", &link).env("VOXLEAF_TEST_TARGET", &external.0)
            .status().unwrap();
        assert!(status.success());
        let result = OptionalChatterboxManager::default().remove_at(&root.0);
        // Remove only the junction itself before temporary-root teardown.
        fs::remove_dir(&link).unwrap();
        assert_eq!(result, Err(OptionalProfileError::VerificationFailed));
        assert_eq!(fs::read(external.0.join("keep.bin")).unwrap(), b"outside");
    }
}

#[cfg(windows)]
#[test]
fn clb05_locked_backup_is_retained_until_successful_retry() {
    use std::os::windows::fs::OpenOptionsExt;
    let root = TestRoot::new();
    let backup = root.0.join("cb/.previous");
    fs::create_dir_all(&backup).unwrap();
    let path = backup.join("locked.bin");
    fs::write(&path, b"synthetic backup").unwrap();
    let lock = fs::OpenOptions::new()
        .read(true)
        .share_mode(0)
        .open(&path)
        .unwrap();
    let manager = OptionalChatterboxManager::default();
    assert_eq!(
        manager.remove_at(&root.0),
        Err(OptionalProfileError::CleanupFailed)
    );
    assert_eq!(
        manager.snapshot_at(&root.0).unwrap().state,
        OptionalProfileState::Failed
    );
    assert!(backup.exists());
    drop(lock);
    assert_eq!(
        manager.remove_at(&root.0).unwrap().state,
        OptionalProfileState::Absent
    );
    assert!(!backup.exists());
}

#[cfg(windows)]
#[test]
fn maf_04_removal_can_retry_after_a_windows_sharing_violation() {
    use std::os::windows::fs::OpenOptionsExt;
    let root = TestRoot::new();
    let package = package_root(&root.0);
    fs::create_dir_all(&package).unwrap();
    let path = package.join("synthetic-locked-file.bin");
    fs::write(&path, b"synthetic owned data").unwrap();
    let lock = fs::OpenOptions::new()
        .read(true)
        .share_mode(0)
        .open(&path)
        .unwrap();
    let manager = OptionalChatterboxManager::default();
    let supervisor = crate::tts_service_supervisor::TtsServiceSupervisor::default();
    assert_eq!(
        manager.remove_after_service_stop(&root.0, &supervisor),
        Err(OptionalProfileError::CleanupFailed)
    );
    assert_eq!(
        manager.snapshot_at(&root.0).unwrap().state,
        OptionalProfileState::Failed
    );
    drop(lock);
    assert_eq!(
        manager
            .remove_after_service_stop(&root.0, &supervisor)
            .unwrap()
            .state,
        OptionalProfileState::Absent
    );
    assert!(!package.exists());
}

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
            filename: "voxleaf-chatterbox-runtime-v7.zip.part-001".to_owned(),
            url: "https://github.com/mmjosedaniel/voxleaf/releases/download/chatterbox-runtime-v7/voxleaf-chatterbox-runtime-v7.zip.part-001".to_owned(),
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

    promote(&root.0, &staging, &authority, None).expect("verified package should promote");

    assert!(!staging.exists());
    assert!(!previous.join("stale.txt").exists());
    assert!(previous.join("runtime/python.exe").is_file());
    assert!(!profile_root(&root.0).join(".previous").exists());
}

#[test]
fn installed_v7_runtime_verifies_after_transient_numba_cache_cleanup() {
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
fn authorized_hash_does_not_admit_invalid_runtime_identity_or_bytecode_cleanup() {
    for (field, invalid) in [
        ("schemaVersion", serde_json::json!(1)),
        ("packageId", serde_json::json!("voxleaf-chatterbox-invalid")),
        ("packageVersion", serde_json::json!("invalid")),
        ("profileId", serde_json::json!("invalid-profile")),
        ("serviceModule", serde_json::json!("invalid.module")),
        ("files", serde_json::json!([])),
    ] {
        let root = TestRoot::new();
        let mut authority = write_runtime(&root.0);
        assert!(verify_runtime(&root.0, &authority).is_ok());
        let path = root.0.join(RUNTIME_MANIFEST_NAME);
        let mut manifest: serde_json::Value =
            serde_json::from_slice(&fs::read(&path).expect("manifest should exist"))
                .expect("manifest should parse");
        manifest[field] = invalid;
        let bytes = serde_json::to_vec(&manifest).expect("manifest should serialize");
        fs::write(&path, &bytes).expect("invalid manifest should be written");
        authority
            .runtime_artifact
            .as_mut()
            .expect("runtime authority should exist")
            .runtime_manifest_sha256 = encode_sha256(Sha256::digest(&bytes));
        assert_eq!(
            verify_runtime(&root.0, &authority),
            Err(OptionalProfileError::VerificationFailed),
            "invalid {field} should fail full verification"
        );

        let cache = root.0.join("runtime/Lib/site-packages/example/__pycache__");
        fs::create_dir_all(&cache).expect("cache directory should be created");
        let bytecode = cache.join("module.cpython-312.pyc");
        fs::write(&bytecode, b"stale bytecode").expect("bytecode should be written");
        assert_eq!(
            remove_unmanifested_python_bytecode(&root.0, &authority),
            Err(OptionalProfileError::VerificationFailed),
            "invalid {field} should fail before bytecode cleanup"
        );
        assert_eq!(
            fs::read(&bytecode).expect("bytecode should remain"),
            b"stale bytecode".to_vec()
        );
    }
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
        "cb/3",
        "cb/5",
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
    let retained_v3 = retained_v3_package_root(&root.0);
    let retained_v5 = retained_v5_package_root(&root.0);
    let retained_v6 = retained_v6_package_root(&root.0);
    let legacy = legacy_package_root(&root.0);
    for directory in [&retained, &retained_v3, &retained_v5, &retained_v6, &legacy] {
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
    for directory in [&retained, &retained_v3, &retained_v5, &retained_v6, &legacy] {
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
            prepare_and_verify_installed_runtime(&worker_root, &worker_authority)
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
        format!("{PACKAGE_ID}\0/runtime/outside.txt"),
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
    assert_eq!(selected.download_bytes, Some(8_240_315_465));
    assert_eq!(selected.minimum_free_bytes, Some(20_000_000_000));
    assert!(!staging_root(&root.0).exists());
    assert!(!profile_root(&root.0).exists());
}
#[test]
fn successor_authority_has_exact_new_identity_and_no_legacy_correction() {
    assert_eq!(PACKAGE_VERSION, "7");
    let retained_v6 = serde_json::from_slice::<OptionalPackageManifest>(include_bytes!(
        "../../../../../services/tts/release/optional/chatterbox/optional-package-manifest-v6.json"
    ))
    .unwrap();
    assert_eq!(
        validate_manifest(&retained_v6),
        Err(OptionalProfileError::Invalid)
    );
    let retained_v5 = serde_json::from_slice::<OptionalPackageManifest>(include_bytes!(
        "../../../../../services/tts/release/optional/chatterbox/optional-package-manifest-v5.json"
    ))
    .unwrap();
    assert_eq!(
        validate_manifest(&retained_v5),
        Err(OptionalProfileError::Invalid)
    );
    let manifest = exact_manifest().expect("v7 authority valid");
    assert_eq!(manifest.identity.package_version, "7");
    assert_eq!(manifest.layout.installed, "cb/7");
    assert!(manifest.runtime_correction.is_none());
    let runtime = manifest.runtime_artifact.as_ref().unwrap();
    assert_eq!(
        runtime
            .parts
            .iter()
            .map(|part| part.download_bytes)
            .sum::<u64>(),
        5_031_363_541
    );
    assert_eq!(runtime.installed_bytes, 5_027_805_469);
    let measurements = manifest.measurements.as_ref().unwrap();
    assert_eq!(measurements.download_bytes, 8_240_315_465);
    assert_eq!(measurements.installed_bytes, 8_236_757_393);
    assert_eq!(measurements.temporary_bytes, 13_271_679_006);
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
    for version in ["2", "3", "4", "5", "6"] {
        changed = manifest.clone();
        changed.identity.package_version = version.to_owned();
        assert_eq!(
            validate_manifest(&changed),
            Err(OptionalProfileError::Invalid)
        );
    }
}

#[test]
fn retained_v2_v3_v5_and_v6_are_cleanup_only_and_survive_observation_and_cancellation() {
    for roots in [
        vec!["cb/2"],
        vec!["cb/3"],
        vec!["cb/5"],
        vec!["cb/6"],
        vec!["profiles/chatterbox-multilingual-v3-cuda-bf16-default-v4/2"],
        vec![
            "cb/2",
            "cb/3",
            "cb/5",
            "cb/6",
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
                prepare_and_verify_installed_runtime(&root.0, &authority),
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

#[cfg(any(windows, unix))]
#[test]
fn saf02_vca02_owned_dangling_links_cannot_be_reported_as_removed() {
    for version in ["5", "6", "7", "3", "2", "legacy", "cache", "staging"] {
        let root = TestRoot::new();
        let outside = TestRoot::new();
        let target = outside.0.join("removed-target");
        fs::create_dir(&target).unwrap();
        fs::write(outside.0.join("keep.bin"), b"outside").unwrap();
        let retained = match version {
            "legacy" => legacy_package_root(&root.0),
            "staging" => staging_root(&root.0),
            _ => profile_root(&root.0).join(version),
        };
        fs::create_dir_all(retained.parent().unwrap()).unwrap();
        #[cfg(unix)]
        std::os::unix::fs::symlink(&target, &retained).unwrap();
        #[cfg(windows)]
        {
            let status = std::process::Command::new("powershell.exe")
                .args(["-NoProfile", "-NonInteractive", "-Command", "New-Item -ItemType Junction -Path $env:VOXLEAF_TEST_LINK -Target $env:VOXLEAF_TEST_TARGET -ErrorAction Stop | Out-Null"])
                .env("VOXLEAF_TEST_LINK", &retained)
                .env("VOXLEAF_TEST_TARGET", &target)
                .status().unwrap();
            assert!(status.success());
        }
        fs::remove_dir(&target).unwrap();
        assert!(!retained.exists());
        let manager = OptionalChatterboxManager::default();
        let discovered = manager.snapshot_at(&root.0);
        let result = manager.remove_at(&root.0);
        let state = manager.snapshot_at(&root.0).unwrap().state;
        let link_remains = fs::symlink_metadata(&retained).is_ok();
        // Remove only the synthetic link before assertions and temporary-root teardown.
        #[cfg(windows)]
        fs::remove_dir(&retained).unwrap();
        #[cfg(unix)]
        fs::remove_file(&retained).unwrap();
        if version != "staging" {
            assert_eq!(
                discovered.unwrap().state,
                OptionalProfileState::Failed,
                "{version}"
            );
        }
        assert_eq!(result, Err(OptionalProfileError::VerificationFailed));
        assert_eq!(state, OptionalProfileState::Failed);
        assert!(link_remains);
        assert_eq!(fs::read(outside.0.join("keep.bin")).unwrap(), b"outside");
        assert_eq!(
            manager.remove_at(&root.0).unwrap().state,
            OptionalProfileState::Absent
        );
        fs::create_dir_all(&retained).unwrap();
        fs::write(retained.join("synthetic.bin"), b"owned").unwrap();
        assert_eq!(
            manager.remove_at(&root.0).unwrap().state,
            OptionalProfileState::Absent
        );
        assert!(!retained.exists());
    }
}

thread_local! {
    static VCA_DENIED_METADATA: std::cell::RefCell<Option<PathBuf>> = const { std::cell::RefCell::new(None) };
}

pub(super) fn owned_path_metadata(path: &Path) -> std::io::Result<fs::Metadata> {
    if VCA_DENIED_METADATA.with(|slot| slot.borrow().as_deref() == Some(path)) {
        Err(std::io::Error::from(std::io::ErrorKind::PermissionDenied))
    } else {
        fs::symlink_metadata(path)
    }
}

#[test]
fn vca02_denied_metadata_is_not_successful_removal() {
    let root = TestRoot::new();
    let package = package_root(&root.0);
    VCA_DENIED_METADATA.with(|slot| *slot.borrow_mut() = Some(package.clone()));
    let discovered = OptionalChatterboxManager::default()
        .snapshot_at(&root.0)
        .unwrap()
        .state;
    let removed = remove_contained_directory(&root.0, &package);
    VCA_DENIED_METADATA.with(|slot| *slot.borrow_mut() = None);
    assert_eq!(discovered, OptionalProfileState::Failed);
    assert_eq!(removed, Err(OptionalProfileError::VerificationFailed));
    assert_eq!(remove_contained_directory(&root.0, &package), Ok(()));
}

#[test]
fn valid_v7_wins_over_retained_versions_and_withheld_removal_cleans_only_owned_roots() {
    let root = TestRoot::new();
    let active = package_root(&root.0);
    let authority = write_runtime(&active);
    let retained = retained_package_root(&root.0);
    let retained_v3 = retained_v3_package_root(&root.0);
    let retained_v5 = retained_v5_package_root(&root.0);
    let retained_v6 = retained_v6_package_root(&root.0);
    for directory in [&retained, &retained_v3, &retained_v5, &retained_v6] {
        fs::create_dir_all(directory).unwrap();
        fs::write(directory.join("keep.bin"), b"retained").unwrap();
    }
    let manager = OptionalChatterboxManager::default();
    assert_eq!(
        manager
            .snapshot_with_manifest(&root.0, &authority)
            .unwrap()
            .state,
        OptionalProfileState::Installed
    );
    assert_eq!(fs::read(retained.join("keep.bin")).unwrap(), b"retained");
    assert_eq!(fs::read(retained_v3.join("keep.bin")).unwrap(), b"retained");
    assert_eq!(fs::read(retained_v5.join("keep.bin")).unwrap(), b"retained");
    assert_eq!(fs::read(retained_v6.join("keep.bin")).unwrap(), b"retained");
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
    assert!(!retained_v3.exists());
    assert!(!retained_v5.exists());
    assert!(!retained_v6.exists());
}
