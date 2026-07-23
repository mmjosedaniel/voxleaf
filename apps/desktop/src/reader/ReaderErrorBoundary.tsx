import { Component, type ReactNode } from "react";

export interface ReaderErrorBoundaryProps {
  readonly children: ReactNode;
  readonly onFailure: () => void;
}

interface ReaderErrorBoundaryState {
  readonly failed: boolean;
}

const HEALTHY_STATE: ReaderErrorBoundaryState = Object.freeze({
  failed: false,
});

const FAILED_STATE: ReaderErrorBoundaryState = Object.freeze({
  failed: true,
});

/** Contains publication presentation failures without inspecting or logging them. */
export class ReaderErrorBoundary extends Component<
  ReaderErrorBoundaryProps,
  ReaderErrorBoundaryState
> {
  public override state: ReaderErrorBoundaryState = HEALTHY_STATE;

  public static getDerivedStateFromError(): ReaderErrorBoundaryState {
    return FAILED_STATE;
  }

  public override componentDidCatch(): void {
    try {
      this.props.onFailure();
    } catch {
      // Keep the fixed fallback visible if application cleanup cannot start.
    }
  }

  public override render(): ReactNode {
    if (this.state.failed) {
      return (
        <section className="reader-failure" role="alert">
          <h2>Reader unavailable</h2>
          <p>
            VoxLeaf could not display this EPUB. Reopen it or choose another
            local EPUB.
          </p>
        </section>
      );
    }

    return this.props.children;
  }
}
