import type { ComponentType, ReactNode } from "react";

import type { ReadyPublicationContentProps } from "./App";
import {
  PublicationHeading,
  RestorationNotice,
  type RestorationPresentation,
} from "./AppPresentation";
import type { ReaderPublicationSummary } from "./reader/reader-lifecycle";

interface ReadyPublicationSectionProps {
  readonly summary: ReaderPublicationSummary;
  readonly restoration: RestorationPresentation | undefined;
  readonly dismissed: boolean;
  readonly onDismiss: () => void;
  readonly ReadyPublicationContent: ComponentType<ReadyPublicationContentProps>;
  readonly readerProps: ReadyPublicationContentProps | undefined;
  readonly narrationControls: ReactNode;
}

export function ReadyPublicationSection({
  summary,
  restoration,
  dismissed,
  onDismiss,
  ReadyPublicationContent,
  readerProps,
  narrationControls,
}: ReadyPublicationSectionProps) {
  return (
    <section
      className="publication-summary"
      aria-labelledby="publication-title"
    >
      <PublicationHeading summary={summary} />
      {readerProps === undefined ? (
        <p className="reader-restoring-state">
          Preparing the saved reader state.
        </p>
      ) : (
        <>
          <RestorationNotice
            restoration={restoration}
            dismissed={dismissed}
            onDismiss={onDismiss}
          />
          {narrationControls}
          <ReadyPublicationContent {...readerProps} />
        </>
      )}
    </section>
  );
}
