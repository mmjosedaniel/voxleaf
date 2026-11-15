# Try VoxLeaf

For a quick introduction, watch the existing video. To try reading for yourself,
follow the local browser route below. To hear local speech, use the Windows
desktop route; running the browser reader alone does not enable narration.

| Route | What you can assess | Prerequisites |
| --- | --- | --- |
| [Existing demo video](https://www.youtube.com/watch?v=2CU36tmh7Fc) | Desktop reading, navigation and bilingual local narration | Browser |
| Local browser reader | Real EPUB ingestion, navigation, appearance and saved position | Repository checkout and pinned Node/pnpm |
| Controlled Windows desktop evaluation | Native process supervision, actual Piper speech and synchronized playback | Approved local package and compatible Windows host |

There is no hosted interactive demo or trusted public application installer at
this checkpoint. The browser reader does not provide native speech. Its Settings
may report unavailable compatibility/version information or optional-package
errors because the native host is absent; those panels are not a hardware test.

## Run the reader locally and generate the sample

You need a repository checkout, Node.js (the repository pins `24.18.0` in
`.nvmrc`) and pnpm **11.15.1**. See the
[prerequisite matrix](../development/setup.md#prerequisite-version-matrix) for
supported Node versions. This browser route does not require Rust, Python, a
GPU or speech-model downloads. The first dependency installation needs network
access.

Open PowerShell in the repository root (the folder containing `package.json`)
and run:

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd build:packages
pnpm.cmd demo:sample
pnpm.cmd --filter @voxleaf/desktop dev
```

Keep that terminal open while using the reader. The last command starts the
development server and stays running; open `http://127.0.0.1:5173` in your browser.
If startup reports that port 5173 is already in use, stop the process you own on
that port before retrying; this configuration does not select another port.

The generator writes `tmp/portfolio/voxleaf-sample.epub` and replaces that generated
file when rerun. Its source is the reviewable XML in [sample/](sample/), packaged
with the existing deterministic EPUB fixture builder. It contains original English
and Spanish demo prose created for VoxLeaf, with no third-party book, model or audio.
The sample shares the repository's MIT license. Repeating the same generator
inputs produces the same bytes, allowing exact-book restoration comparisons.

## A short reader walkthrough

1. Open `http://127.0.0.1:5173` and choose **Open a book**. Select the generated EPUB.
2. Confirm the title **A Quiet Morning**. On a first opening, the reader starts
   with the English passage. If you previously used this sample, it may restore
   your saved position; select **A Quiet Morning** in the table of contents to
   return to the English section.
3. Open the table of contents and select **Una mañana tranquila**. The reader
   should move to the Spanish heading. These are two destinations in one spine
   document (one chapter), so **Previous chapter** and **Next chapter** are
   disabled for this example. Use the table of contents to switch languages.
4. In Settings, change text size or theme and close Settings. Continue reading
   using the dedicated scroll area.
5. Stop scrolling briefly, note the visible passage, then reload the page in
   the same browser profile at the same address. Choose **Open a book** and
   select the same generated file. Check that the appearance and logical
   reading position are restored; an identical page number or pixel offset is
   not expected after a layout change. This requires browser storage to remain
   available and uncleared. Changing browser/profile/address or clearing site
   data starts a separate or empty store. The application deliberately does
   not retain a path that silently reopens your book.
6. Stop the local development server with Ctrl+C when finished.

## Desktop narration walkthrough

Use an existing authorized Windows package, following the
[Windows installation guide](../user/windows-release.md#install), or build it
using the [developer package procedure](../development/setup.md#build-the-m011-windows-package)
and its full desktop prerequisites. Public signing remains
pending; this guide does not offer a download or ask you to bypass OS warnings.

1. Open the same sample and select **A Quiet Morning** in the table of contents.
2. Open **Settings**, then find **Narration**. Under **Narration language**,
   select **English**. Under **Local narration profile**, select
   **Piper and joe English fast CPU profile** when it is available.
3. Choose **Quick start**, close Settings and press **Play**. Observe preparation,
   audible speech and the followed passage. Try **Pause**, **Resume** and **Stop**.
4. After stopping, select **Una mañana tranquila** in the table of contents.
   In Settings, select **Spanish** and
   **Piper and davefx Spanish fast CPU profile**. Close Settings and press Play.

If a profile is unavailable or Play remains disabled, inspect **Device
compatibility** in Settings and **Show narration details** in the reader; do not
interpret an unavailable control as successful narration. Language selection is
explicit. The sample's language markup does not automatically switch voices:
stop or change the selected language before listening to the other section.

Quick start targets approximately 15 seconds of *buffered audio*, not a fixed
15-second wall-clock wait. Cold model startup can take longer. Chatterbox is
optional and unnecessary for evaluating the basic experience; downloading it
requires a separate compatible-host check and explicit consent.

## Which downloads are the application?

GitHub releases named `chatterbox-runtime-vN` contain optional engine components.
They are **not application installers**, even if GitHub labels one `Latest`.
Use the current support matrix and native compatibility checks to identify an
admitted runtime. A historical release label is not product admission.

## Screenshot provenance

[reader.jpg](assets/reader.jpg) is a curated product illustration captured from
the actual browser development reader at source base `97d36c2`, with this sample
and the Light theme. It shows navigation focus, not an audible highlight.
No private publication, filesystem path or user data appears in the image.
The browser capture is not evidence of installed Windows narration or audio quality.
