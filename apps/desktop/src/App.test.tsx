import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { App } from "./App";

afterEach(cleanup);

describe("desktop development shell", () => {
  it("renders an accessible main region and heading", () => {
    render(<App />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "VoxLeaf development shell",
      }),
    ).toBeInTheDocument();
  });
});
