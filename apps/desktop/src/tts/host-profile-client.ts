import { invoke } from "@tauri-apps/api/core";
import {
  decodeHostProfileCompatibilityReportV1,
  type HostProfileCompatibilityReportV1,
} from "@voxleaf/shared";

export type HostProfileDetectionClientErrorCode =
  "host-profile-probe-invalid-response" | "host-profile-probe-unavailable";

export class HostProfileDetectionClientError extends Error {
  public readonly code: HostProfileDetectionClientErrorCode;

  public constructor(code: HostProfileDetectionClientErrorCode) {
    super("The local host compatibility probe failed.");
    this.name = "HostProfileDetectionClientError";
    this.code = code;
  }
}

type InvokePort = <T>(
  command: string,
  args?: Record<string, unknown>,
) => Promise<T>;

export class HostProfileDetectionClient {
  private readonly invokePort: InvokePort;

  public constructor(invokePort: InvokePort = invoke) {
    this.invokePort = invokePort;
  }

  public async detect(): Promise<HostProfileCompatibilityReportV1> {
    let response: unknown;
    try {
      response = await this.invokePort<unknown>(
        "detect_host_profile_compatibility",
      );
    } catch {
      throw new HostProfileDetectionClientError(
        "host-profile-probe-unavailable",
      );
    }

    try {
      return decodeHostProfileCompatibilityReportV1(response);
    } catch {
      throw new HostProfileDetectionClientError(
        "host-profile-probe-invalid-response",
      );
    }
  }
}
