//! One abortable network task. Disk writes and acquisition cleanup stay with the caller.
use super::*;
use std::io;
use tauri::async_runtime::{JoinHandle, Receiver, channel};

pub(super) type TransferAbort = Mutex<Option<Box<dyn Fn() + Send>>>;

enum Message {
    Headers(reqwest::StatusCode, Option<u64>),
    Data(Vec<u8>),
    Error(reqwest::Error),
    End,
}

pub(super) struct TransferResponse<'a> {
    receiver: Receiver<Message>,
    task: Option<JoinHandle<()>>,
    abort: &'a TransferAbort,
    status: reqwest::StatusCode,
    length: Option<u64>,
    pending: io::Cursor<Vec<u8>>,
}

impl TransferResponse<'_> {
    pub fn status(&self) -> reqwest::StatusCode {
        self.status
    }
    pub fn content_length(&self) -> Option<u64> {
        self.length
    }
}

impl Read for TransferResponse<'_> {
    fn read(&mut self, buffer: &mut [u8]) -> io::Result<usize> {
        if buffer.is_empty() {
            return Ok(0);
        }
        loop {
            let read = self.pending.read(buffer)?;
            if read > 0 {
                return Ok(read);
            }
            match self.receiver.blocking_recv() {
                Some(Message::Data(bytes)) => self.pending = io::Cursor::new(bytes),
                Some(Message::End) => return Ok(0),
                Some(Message::Error(error)) => return Err(io::Error::other(error)),
                _ => return Err(io::Error::other("optional-transfer-interrupted")),
            }
        }
    }
}

impl Drop for TransferResponse<'_> {
    fn drop(&mut self) {
        if let Ok(mut abort) = self.abort.lock() {
            abort.take();
        }
        if let Some(task) = self.task.take() {
            task.abort();
            // Abort is only a request. Join before releasing the acquisition's
            // file/staging/worker ownership, including rejected headers/errors.
            let _ = tauri::async_runtime::block_on(task);
        }
    }
}

pub(super) fn start<'a>(
    request: reqwest::RequestBuilder,
    cancelled: &AtomicBool,
    abort: &'a TransferAbort,
    diagnostic: &DownloadAttempt<'_>,
) -> Result<TransferResponse<'a>, OptionalProfileError> {
    check_acquisition_cancellation(Some(cancelled))?;
    let (sender, receiver) = channel(1);
    let task = tauri::async_runtime::spawn(async move {
        let mut response = match request.send().await {
            Ok(response) => response,
            Err(error) => {
                let _ = sender.send(Message::Error(error)).await;
                return;
            }
        };
        if sender
            .send(Message::Headers(
                response.status(),
                response.content_length(),
            ))
            .await
            .is_err()
        {
            return;
        }
        loop {
            match response.chunk().await {
                Ok(Some(bytes)) => {
                    // One bounded queued chunk plus the caller's current chunk.
                    for chunk in bytes.chunks(COPY_BUFFER_BYTES) {
                        if sender.send(Message::Data(chunk.to_vec())).await.is_err() {
                            return;
                        }
                    }
                }
                Ok(None) => {
                    let _ = sender.send(Message::End).await;
                    return;
                }
                Err(error) => {
                    let _ = sender.send(Message::Error(error)).await;
                    return;
                }
            }
        }
    });
    let cancel_task = task.inner().abort_handle();
    let mut response = TransferResponse {
        receiver,
        task: Some(task),
        abort,
        status: reqwest::StatusCode::OK,
        length: None,
        pending: io::Cursor::new(Vec::new()),
    };
    #[cfg(test)]
    tests::r7_before_transfer_publication();
    {
        let mut slot = abort
            .lock()
            .map_err(|_| OptionalProfileError::CleanupFailed)?;
        // Cancellation can arrive before handle publication. Serialize the
        // check/publication with cancellation's access to this same slot.
        if cancelled.load(Ordering::Acquire) {
            cancel_task.abort();
        }
        *slot = Some(Box::new(move || cancel_task.abort()));
    }
    let header = response.receiver.blocking_recv();
    check_acquisition_cancellation(Some(cancelled))?;
    match header {
        Some(Message::Headers(status, length)) => {
            response.status = status;
            response.length = length;
            Ok(response)
        }
        Some(Message::Error(error)) => Err(diagnostic.fail(
            DownloadStage::Request,
            DownloadFailureKind::Request,
            Some(&error),
        )),
        _ => Err(diagnostic.fail(DownloadStage::Request, DownloadFailureKind::Request, None)),
    }
}
