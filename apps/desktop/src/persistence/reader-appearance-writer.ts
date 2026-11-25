import type { ReaderPreferencesV1 } from "../reader/reader-preferences";
import type {
  ReaderPositionRepository,
  ReaderRepositoryWriteResult,
} from "./reader-position-repository";

type AppearanceWrite = {
  revision: number;
  preferences: ReaderPreferencesV1;
};
type AppearanceWriteReport = (
  preferences: ReaderPreferencesV1,
  result: ReaderRepositoryWriteResult,
) => void;

/** Serializes the App's appearance writes independently of book ownership. */
export class ReaderAppearanceWriter {
  readonly #repository: Pick<ReaderPositionRepository, "writePreferences">;
  #report: AppearanceWriteReport | undefined;
  #revision = 0;
  #queued: AppearanceWrite | undefined;
  #draining = false;
  #closed = false;

  public constructor(
    repository: Pick<ReaderPositionRepository, "writePreferences">,
  ) {
    this.#repository = repository;
  }

  public get canHydrate(): boolean {
    return !this.#closed && this.#revision === 0;
  }

  public enqueue(
    preferences: ReaderPreferencesV1,
    report: AppearanceWriteReport,
  ): void {
    if (this.#closed) return;
    this.#report = report;
    this.#queued = { revision: ++this.#revision, preferences };
    if (this.#draining) return;
    this.#draining = true;
    queueMicrotask(() => void this.#drain());
  }

  public close(): void {
    // Accepted writes still drain after the App's result sink is released.
    this.#closed = true;
    this.#report = undefined;
  }

  async #drain(): Promise<void> {
    while (this.#queued !== undefined) {
      const { revision, preferences } = this.#queued;
      this.#queued = undefined;
      let result: ReaderRepositoryWriteResult = { status: "unavailable" };
      try {
        result = await this.#repository.writePreferences(preferences);
      } catch {
        // A failed local write never interrupts the visible reflow.
      }
      if (revision === this.#revision) this.#report?.(preferences, result);
    }
    this.#draining = false;
  }
}
