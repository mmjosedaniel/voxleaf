import {
  HARDWARE_PROFILE_AUTHORITY_V1,
  RECOVERY_FAILURE_AUTHORITY_V1,
  RECOVERY_TRANSITION_TABLE_V1,
  type RecoveryActionV1,
  type RecoveryEventV1,
  type RecoveryFailureAuthorityV1,
  type RecoveryFailureCodeV1,
  type RecoveryPhaseV1,
} from "./hardware-profile-authority";

export type RecoveryCleanupFailureCodeV1 =
  | "cancellation-timeout"
  | "cleanup-failed"
  | "protocol-failed";

export interface OperationalRecoveryDiagnosticV1 {
  readonly failureCode: RecoveryFailureCodeV1;
  readonly phase: RecoveryPhaseV1;
  readonly sequence: number;
  readonly profileId: string;
}

export interface OperationalRecoverySnapshotV1 {
  readonly phase: RecoveryPhaseV1;
  readonly failureCode: RecoveryFailureCodeV1 | undefined;
  readonly action: RecoveryActionV1 | undefined;
  readonly canRecover: boolean;
  readonly explicitAttemptUsed: boolean;
  readonly diagnostics: readonly OperationalRecoveryDiagnosticV1[];
}

export class OperationalRecoveryStateError extends Error {
  public constructor() {
    super("The local narration recovery state is invalid.");
    this.name = "OperationalRecoveryStateError";
  }
}

const FAILURE_BY_CODE = new Map<
  RecoveryFailureCodeV1,
  RecoveryFailureAuthorityV1
>(
  RECOVERY_FAILURE_AUTHORITY_V1.map((failure) => [failure.code, failure]),
);

function validProfileId(profileId: string): boolean {
  const bounds = HARDWARE_PROFILE_AUTHORITY_V1.registry;
  return (
    profileId.length > 0 &&
    Array.from(profileId).length <= bounds.maximumIdentifierCodePoints &&
    new TextEncoder().encode(profileId).length <=
      bounds.maximumIdentifierUtf8Bytes
  );
}

function failureFor(
  code: RecoveryFailureCodeV1,
): RecoveryFailureAuthorityV1 {
  const failure = FAILURE_BY_CODE.get(code);
  if (failure === undefined) {
    throw new OperationalRecoveryStateError();
  }
  return failure;
}

/**
 * Pure desktop-local implementation of the frozen M010 recovery transition
 * authority. It owns only closed content-free state and an eight-entry
 * in-memory diagnostic tail.
 */
export class OperationalRecoveryController {
  readonly #maximumDiagnostics =
    HARDWARE_PROFILE_AUTHORITY_V1.recovery.observations
      .maximumRetainedFailureEntries;
  readonly #diagnostics: OperationalRecoveryDiagnosticV1[] = [];
  #phase: RecoveryPhaseV1 = "operational";
  #failure: RecoveryFailureAuthorityV1 | undefined;
  #profileId: string | undefined;
  #explicitAttemptUsed = false;
  #sequence = 0;
  #snapshot: OperationalRecoverySnapshotV1 = Object.freeze({
    phase: "operational",
    failureCode: undefined,
    action: undefined,
    canRecover: false,
    explicitAttemptUsed: false,
    diagnostics: Object.freeze([]),
  });

  public observe(): OperationalRecoverySnapshotV1 {
    return this.#snapshot;
  }

  public detectFailure(
    code: RecoveryFailureCodeV1,
    profileId: string,
  ): void {
    if (this.#phase !== "operational" || !validProfileId(profileId)) {
      throw new OperationalRecoveryStateError();
    }
    const effectiveCode = this.#explicitAttemptUsed
      ? "repeated-recovery-failed"
      : code;
    this.#failure = failureFor(effectiveCode);
    this.#profileId = profileId;
    this.#transition("failure-detected");
  }

  public markIdentityInvalidated(): void {
    this.#transition("identity-invalidated");
  }

  public markPlaybackAndPreparationReleased(): void {
    this.#transition("playback-and-preparation-released");
  }

  public markServiceContained(): void {
    this.#transition("service-contained");
  }

  public markCleanupVerified(recoveryActionAvailable = true): void {
    const failure = this.#expectFailure();
    const recoverable =
      recoveryActionAvailable &&
      !this.#explicitAttemptUsed &&
      failure.explicitAttempts === 1 &&
      failure.action !== "contain-and-stop";
    this.#transition(
      recoverable
        ? "cleanup-verified-recoverable"
        : "cleanup-verified-terminal",
    );
  }

  public markCleanupFailed(code: RecoveryCleanupFailureCodeV1): void {
    this.#failure = failureFor(code);
    this.#transition("cleanup-failed");
  }

  public requestRecovery(): void {
    const failure = this.#expectFailure();
    if (
      failure.explicitAttempts !== 1 ||
      failure.action === "contain-and-stop" ||
      this.#explicitAttemptUsed
    ) {
      throw new OperationalRecoveryStateError();
    }
    this.#explicitAttemptUsed = true;
    this.#transition("explicit-recovery-requested");
  }

  public markRecoverySucceeded(): void {
    this.#transition("recovery-succeeded");
    this.#failure = undefined;
    this.#profileId = undefined;
    this.#refreshSnapshot();
  }

  public markRecoveryFailed(): void {
    this.#failure = failureFor("repeated-recovery-failed");
    this.#transition("recovery-failed");
  }

  /**
   * An explicit profile selection or compatibility recheck starts a new
   * failure episode. It never starts narration or performs recovery itself.
   */
  public resetEpisode(): void {
    if (
      this.#phase === "invalidating" ||
      this.#phase === "releasing" ||
      this.#phase === "containing-service" ||
      this.#phase === "verifying-cleanup" ||
      this.#phase === "recovering"
    ) {
      throw new OperationalRecoveryStateError();
    }
    this.#phase = "operational";
    this.#failure = undefined;
    this.#profileId = undefined;
    this.#explicitAttemptUsed = false;
    this.#refreshSnapshot();
  }

  #expectFailure(): RecoveryFailureAuthorityV1 {
    if (this.#failure === undefined || this.#profileId === undefined) {
      throw new OperationalRecoveryStateError();
    }
    return this.#failure;
  }

  #transition(event: RecoveryEventV1): void {
    const transition = RECOVERY_TRANSITION_TABLE_V1.find(
      (candidate) => candidate.event === event,
    );
    if (
      transition === undefined ||
      !transition.from.includes(this.#phase) ||
      this.#failure === undefined ||
      this.#profileId === undefined
    ) {
      throw new OperationalRecoveryStateError();
    }
    this.#phase = transition.to;
    this.#appendDiagnostic();
    this.#refreshSnapshot();
  }

  #appendDiagnostic(): void {
    const failure = this.#expectFailure();
    this.#sequence =
      this.#sequence === Number.MAX_SAFE_INTEGER ? 1 : this.#sequence + 1;
    this.#diagnostics.push(
      Object.freeze({
        failureCode: failure.code,
        phase: this.#phase,
        sequence: this.#sequence,
        profileId: this.#profileId!,
      }),
    );
    if (this.#diagnostics.length > this.#maximumDiagnostics) {
      this.#diagnostics.splice(
        0,
        this.#diagnostics.length - this.#maximumDiagnostics,
      );
    }
  }

  #refreshSnapshot(): void {
    this.#snapshot = Object.freeze({
      phase: this.#phase,
      failureCode: this.#failure?.code,
      action: this.#failure?.action,
      canRecover:
        this.#phase === "recovery-available" &&
        this.#failure?.explicitAttempts === 1 &&
        this.#failure.action !== "contain-and-stop" &&
        !this.#explicitAttemptUsed,
      explicitAttemptUsed: this.#explicitAttemptUsed,
      diagnostics: Object.freeze([...this.#diagnostics]),
    });
  }
}
