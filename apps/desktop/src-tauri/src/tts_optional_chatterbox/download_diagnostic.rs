//! One content-free failure per application process; never persisted here.
use super::{DownloadSource, OptionalProfileError};
use serde::Serialize;
use std::{error::Error, sync::Mutex, time::Instant};

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub(crate) enum DownloadStage {
    Request,
    Response,
    CreateFile,
    Read,
    Write,
    Flush,
    Verify,
    Rename,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub(crate) enum DownloadFailureKind {
    InvalidUrl,
    RedirectRejected,
    Request,
    Timeout,
    Connection,
    HttpStatus,
    ContentLength,
    Io,
    SizeLimit,
    Incomplete,
    Integrity,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct DownloadDiagnostic {
    pub schema_version: u8,
    pub app_version: &'static str,
    pub package_version: &'static str,
    pub source: &'static str,
    pub artifact_index: u8,
    pub stage: DownloadStage,
    pub kind: DownloadFailureKind,
    pub elapsed_ms: u64,
    pub received_bytes: u64,
    pub expected_bytes: u64,
    pub http_status: Option<u16>,
    #[serde(serialize_with = "serialize_content_length")]
    pub content_length: Option<u64>,
    pub os_error: Option<i32>,
}

fn serialize_content_length<S: serde::Serializer>(
    value: &Option<u64>,
    serializer: S,
) -> Result<S::Ok, S::Error> {
    value.map(|bytes| bytes.to_string()).serialize(serializer)
}

pub(super) struct DownloadAttempt<'a> {
    slot: &'a Mutex<Option<DownloadDiagnostic>>,
    started: Instant,
    report: DownloadDiagnostic,
}

impl<'a> DownloadAttempt<'a> {
    pub fn new(
        slot: &'a Mutex<Option<DownloadDiagnostic>>,
        source: DownloadSource,
        artifact_index: u8,
        expected_bytes: u64,
    ) -> Self {
        Self {
            slot,
            started: Instant::now(),
            report: DownloadDiagnostic {
                schema_version: 1,
                app_version: env!("CARGO_PKG_VERSION"),
                package_version: super::PACKAGE_VERSION,
                source: match source {
                    DownloadSource::GithubRelease => "github-release",
                    DownloadSource::HuggingFace => "hugging-face",
                },
                artifact_index,
                stage: DownloadStage::Request,
                kind: DownloadFailureKind::Request,
                elapsed_ms: 0,
                received_bytes: 0,
                expected_bytes,
                http_status: None,
                content_length: None,
                os_error: None,
            },
        }
    }

    pub fn received(&mut self, bytes: u64) {
        self.report.received_bytes = bytes;
    }

    pub fn response(
        &mut self,
        status: reqwest::StatusCode,
        content_length: Option<u64>,
    ) -> Result<(), OptionalProfileError> {
        self.report.http_status = Some(status.as_u16());
        self.report.content_length = content_length;
        let reason = if !status.is_success() {
            Some(DownloadFailureKind::HttpStatus)
        } else if content_length != Some(self.report.expected_bytes) {
            Some(DownloadFailureKind::ContentLength)
        } else {
            None
        };
        match reason {
            Some(kind) => Err(self.fail(DownloadStage::Response, kind, None)),
            None => Ok(()),
        }
    }

    pub fn fail(
        &self,
        stage: DownloadStage,
        kind: DownloadFailureKind,
        error: Option<&(dyn Error + 'static)>,
    ) -> OptionalProfileError {
        let mut report = self.report;
        report.stage = stage;
        report.kind = kind;
        report.elapsed_ms = self.started.elapsed().as_millis().min(u64::MAX as u128) as u64;
        let mut source = error;
        // Inspect only typed metadata. Display/Debug strings may contain URLs,
        // signed query strings, response bodies or private filesystem paths.
        for _ in 0..8 {
            let Some(error) = source else { break };
            if let Some(request) = error.downcast_ref::<reqwest::Error>() {
                report.kind = if request.is_timeout() {
                    DownloadFailureKind::Timeout
                } else if request.is_redirect() {
                    DownloadFailureKind::RedirectRejected
                } else if request.is_connect() {
                    DownloadFailureKind::Connection
                } else {
                    report.kind
                };
            }
            if let Some(io) = error.downcast_ref::<std::io::Error>() {
                report.os_error = report.os_error.or(io.raw_os_error());
                if io.kind() == std::io::ErrorKind::TimedOut {
                    report.kind = DownloadFailureKind::Timeout;
                }
            }
            source = error.source();
        }
        if let Ok(mut last) = self.slot.lock() {
            *last = Some(report);
        }
        if stage == DownloadStage::Verify {
            OptionalProfileError::VerificationFailed
        } else {
            OptionalProfileError::DownloadFailed
        }
    }
}
