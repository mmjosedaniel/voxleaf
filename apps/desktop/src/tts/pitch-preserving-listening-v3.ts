import { createIncrementalWsolaV3Node } from "./playback-backends/incremental-wsola-v3";

const CANDIDATES = Object.freeze([
  Object.freeze({
    id: "html-media-element-preserves-pitch-wav-boundary-v3",
    label: "Candidate A",
  }),
  Object.freeze({
    id: "repository-incremental-audio-worklet-wsola-boundary-v3",
    label: "Candidate B",
  }),
] as const);
const RATES = Object.freeze([100, 85, 75] as const);
const SCORE_FIELDS = Object.freeze([
  "intelligibility",
  "naturalness",
  "artifacts",
] as const);

type CandidateId = (typeof CANDIDATES)[number]["id"];
type RatePercent = (typeof RATES)[number];
type ScoreField = (typeof SCORE_FIELDS)[number];

interface ListeningCase {
  readonly audioPath: string;
  readonly caseId: string;
  readonly language: "es" | "en";
  readonly text: string;
}

interface ListeningManifest {
  readonly authorityCommitSha: string;
  readonly cases: readonly ListeningCase[];
  readonly executionCommitSha: string;
  readonly schemaVersion: "voxleaf-playback-listening-manifest-v3";
  readonly sessionId: string;
}

interface ListeningRating {
  readonly candidateId: CandidateId;
  readonly caseId: string;
  readonly language: "es" | "en";
  readonly omittedOrRepeatedWords: boolean;
  readonly ratePercent: RatePercent;
  readonly scores: Readonly<Record<ScoreField, number>>;
}

declare global {
  interface Window {
    readonly __voxleafSubmitPitchPreservingListeningV3?: (
      result: object,
    ) => Promise<void>;
  }
}

let stopActivePlayback: (() => Promise<void>) | undefined;
const audioBytes = new Map<string, Promise<ArrayBuffer>>();

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text?: string,
): HTMLElementTagNameMap[K] {
  const value = document.createElement(tag);
  if (text !== undefined) {
    value.textContent = text;
  }
  return value;
}

function fetchAudio(path: string): Promise<ArrayBuffer> {
  const existing = audioBytes.get(path);
  if (existing !== undefined) {
    return existing.then((value) => value.slice(0));
  }
  const request = fetch(path, { cache: "no-store", credentials: "omit" }).then(
    async (response) => {
      if (!response.ok) {
        throw new Error("listening-audio-unavailable");
      }
      return response.arrayBuffer();
    },
  );
  audioBytes.set(path, request);
  return request.then((value) => value.slice(0));
}

async function stopPlayback(): Promise<void> {
  const stop = stopActivePlayback;
  stopActivePlayback = undefined;
  if (stop !== undefined) {
    await stop();
  }
}

async function playMedia(
  listeningCase: ListeningCase,
  ratePercent: RatePercent,
): Promise<void> {
  await stopPlayback();
  const bytes = await fetchAudio(listeningCase.audioPath);
  const objectUrl = URL.createObjectURL(
    new Blob([bytes], { type: "audio/wav" }),
  );
  const audio = new Audio(objectUrl);
  audio.preservesPitch = true;
  audio.defaultPlaybackRate = ratePercent / 100;
  audio.playbackRate = ratePercent / 100;
  let stopped = false;
  const release = async (): Promise<void> => {
    if (stopped) {
      return;
    }
    stopped = true;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    URL.revokeObjectURL(objectUrl);
  };
  stopActivePlayback = release;
  audio.addEventListener(
    "ended",
    () => {
      void release();
      if (stopActivePlayback === release) {
        stopActivePlayback = undefined;
      }
    },
    { once: true },
  );
  await audio.play();
}

async function playRepositoryWsola(
  listeningCase: ListeningCase,
  ratePercent: RatePercent,
): Promise<void> {
  if (ratePercent === 100) {
    await playMedia(listeningCase, ratePercent);
    return;
  }
  await stopPlayback();
  const context = new AudioContext({
    latencyHint: "interactive",
    sampleRate: 24_000,
  });
  const decoded = await context.decodeAudioData(
    await fetchAudio(listeningCase.audioPath),
  );
  const samples = new Float32Array(decoded.getChannelData(0));
  const controller = await createIncrementalWsolaV3Node(context);
  controller.node.connect(context.destination);
  let stopped = false;
  const release = async (): Promise<void> => {
    if (stopped) {
      return;
    }
    stopped = true;
    controller.node.port.postMessage({ type: "stop" });
    controller.close();
    await context.close();
  };
  stopActivePlayback = release;
  controller.node.port.addEventListener("message", (event: MessageEvent) => {
    const message = event.data as { type?: unknown };
    if (message.type === "armed") {
      controller.node.port.postMessage({ type: "start" });
    }
    if (message.type === "ended") {
      void release();
      if (stopActivePlayback === release) {
        stopActivePlayback = undefined;
      }
    }
  });
  controller.node.port.start();
  controller.node.port.postMessage(
    {
      type: "arm",
      input: samples,
      ratePercent,
      unitSequence: 0,
    },
    [samples.buffer],
  );
  await context.resume();
}

function scoreSelect(field: ScoreField): HTMLSelectElement {
  const select = element("select");
  select.dataset.score = field;
  select.setAttribute("aria-label", field);
  select.innerHTML =
    '<option value="">Select</option>' +
    [1, 2, 3, 4, 5]
      .map(
        (score) => `<option value="${String(score)}">${String(score)}</option>`,
      )
      .join("");
  return select;
}

function defectSelect(): HTMLSelectElement {
  const select = element("select");
  select.dataset.defect = "omitted-or-repeated-words";
  select.setAttribute("aria-label", "Omitted or repeated words");
  select.innerHTML =
    '<option value="">Select</option>' +
    '<option value="false">No</option><option value="true">Yes</option>';
  return select;
}

function listeningCard(
  listeningCase: ListeningCase,
  candidate: (typeof CANDIDATES)[number],
  ratePercent: RatePercent,
): HTMLElement {
  const card = element("article");
  card.dataset.candidateId = candidate.id;
  card.dataset.caseId = listeningCase.caseId;
  card.dataset.language = listeningCase.language;
  card.dataset.ratePercent = String(ratePercent);
  card.className = "listening-card";
  card.append(
    element(
      "h3",
      `${candidate.label} · ${listeningCase.language.toUpperCase()} · ${(ratePercent / 100).toFixed(2)}x`,
    ),
    element("p", listeningCase.text),
  );
  const play = element("button", "Play sample");
  play.type = "button";
  play.addEventListener("click", () => {
    const action =
      candidate.id === "html-media-element-preserves-pitch-wav-boundary-v3"
        ? playMedia(listeningCase, ratePercent)
        : playRepositoryWsola(listeningCase, ratePercent);
    void action.catch(() => {
      globalThis.alert("This sample could not be played.");
    });
  });
  card.append(play);
  for (const field of SCORE_FIELDS) {
    const label = element("label", `${field}: `);
    label.append(scoreSelect(field));
    card.append(label);
  }
  const defectLabel = element("label", "Omitted or repeated words: ");
  defectLabel.append(defectSelect());
  card.append(defectLabel);
  return card;
}

function collectRatings(): readonly ListeningRating[] | null {
  const ratings: ListeningRating[] = [];
  for (const card of document.querySelectorAll<HTMLElement>(
    ".listening-card",
  )) {
    const candidateId = card.dataset.candidateId as CandidateId;
    const language = card.dataset.language as "es" | "en";
    const ratePercent = Number(card.dataset.ratePercent) as RatePercent;
    const scores = {} as Record<ScoreField, number>;
    for (const field of SCORE_FIELDS) {
      const value = card.querySelector<HTMLSelectElement>(
        `[data-score="${field}"]`,
      )?.value;
      if (value === undefined || value === "") {
        return null;
      }
      scores[field] = Number(value);
    }
    const defect =
      card.querySelector<HTMLSelectElement>("[data-defect]")?.value;
    if (defect === undefined || defect === "") {
      return null;
    }
    ratings.push(
      Object.freeze({
        candidateId,
        caseId: card.dataset.caseId ?? "",
        language,
        omittedOrRepeatedWords: defect === "true",
        ratePercent,
        scores: Object.freeze(scores),
      }),
    );
  }
  return Object.freeze(ratings);
}

async function mount(): Promise<void> {
  const response = await fetch("/playback-v3-listening/manifest.json", {
    cache: "no-store",
    credentials: "omit",
  });
  const manifest = (await response.json()) as ListeningManifest;
  if (
    manifest.schemaVersion !== "voxleaf-playback-listening-manifest-v3" ||
    manifest.cases.length !== 4
  ) {
    throw new Error("listening-manifest-invalid");
  }
  const root = document.querySelector<HTMLElement>("#listening-root");
  if (root === null) {
    throw new Error("listening-root-missing");
  }
  root.append(
    element("h1", "VoxLeaf boundary-deferred playback comparison"),
    element(
      "p",
      "Listen to every sample and score intelligibility, naturalness, and artifacts from 1 (unusable) to 5 (excellent). Mark any omitted or repeated word. Candidate labels are intentionally neutral.",
    ),
  );
  const stop = element("button", "Stop current sample");
  stop.type = "button";
  stop.addEventListener("click", () => void stopPlayback());
  root.append(stop);

  for (const listeningCase of manifest.cases) {
    const section = element("section");
    section.append(
      element(
        "h2",
        `${listeningCase.language.toUpperCase()} · ${listeningCase.caseId}`,
      ),
    );
    for (const ratePercent of RATES) {
      for (const candidate of CANDIDATES) {
        section.append(listeningCard(listeningCase, candidate, ratePercent));
      }
    }
    root.append(section);
  }

  const fluency = element("fieldset");
  fluency.innerHTML = `
    <legend>Evaluator fluency confirmation</legend>
    <label><input type="checkbox" data-fluent="es"> I understand Spanish fluently.</label>
    <label><input type="checkbox" data-fluent="en"> I understand English fluently.</label>
  `;
  root.append(fluency);

  const submit = element("button", "Submit completed comparison");
  submit.type = "button";
  submit.addEventListener("click", () => {
    const ratings = collectRatings();
    const fluentSpanish =
      root.querySelector<HTMLInputElement>('[data-fluent="es"]')?.checked ===
      true;
    const fluentEnglish =
      root.querySelector<HTMLInputElement>('[data-fluent="en"]')?.checked ===
      true;
    if (ratings === null || !fluentSpanish || !fluentEnglish) {
      globalThis.alert(
        "Complete every score, omission field, and fluency confirmation first.",
      );
      return;
    }
    const deliver = window.__voxleafSubmitPitchPreservingListeningV3;
    if (deliver === undefined) {
      globalThis.alert("The bounded evaluator host is unavailable.");
      return;
    }
    submit.disabled = true;
    void stopPlayback()
      .then(() =>
        deliver({
          authorityCommitSha: manifest.authorityCommitSha,
          executionCommitSha: manifest.executionCommitSha,
          schemaVersion: "voxleaf-playback-listening-result-v3",
          sessionId: manifest.sessionId,
          evaluatorCountByLanguage: { es: 1, en: 1 },
          ratings,
        }),
      )
      .catch(() => {
        submit.disabled = false;
        globalThis.alert("The result could not be submitted.");
      });
  });
  root.append(submit);
}

document.body.style.fontFamily = "system-ui, sans-serif";
document.body.style.margin = "2rem auto";
document.body.style.maxWidth = "1100px";
document.body.style.padding = "0 1rem";
const style = element("style");
style.textContent = `
  section { border-top: 2px solid #164d35; margin-top: 2rem; }
  .listening-card { border: 1px solid #9aab9f; border-radius: .5rem;
    display: grid; gap: .65rem; margin: 1rem 0; padding: 1rem; }
  button, select { font: inherit; padding: .45rem .65rem; }
  label { display: flex; gap: .5rem; justify-content: space-between; }
  fieldset { display: grid; gap: .75rem; margin: 2rem 0; }
`;
document.head.append(style);
void mount();
