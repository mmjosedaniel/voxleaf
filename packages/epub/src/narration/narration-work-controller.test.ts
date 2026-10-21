import { describe, expect, it } from "vitest";
import {
  NarrationOperationWorkBudget,
  NarrationWorkController,
} from "./narration-work-controller.js";

describe("whole-operation narration traversal accounting", () => {
  it("admits the exact work maximum and rejects maximum plus one across separate windows", async () => {
    const budget = new NarrationOperationWorkBudget(3);
    const signal = new AbortController().signal;
    const first = new NarrationWorkController(
      signal,
      async () => undefined,
      budget,
    );
    const second = new NarrationWorkController(
      signal,
      async () => undefined,
      budget,
    );
    await first.observe();
    budget.charge(1); // bounded synchronous work is charged to the same owner
    await second.observe();
    expect(budget.charged).toBe(3);
    await expect(second.observe()).rejects.toMatchObject({
      code: "resource-limit-exceeded",
    });
    expect(budget.charged).toBe(3);
  });

  it("checks cancellation after a cooperative yield before exposing further work", async () => {
    const abort = new AbortController();
    const budget = new NarrationOperationWorkBudget(10_000);
    const work = new NarrationWorkController(
      abort.signal,
      async () => {
        abort.abort();
      },
      budget,
    );
    await expect(
      (async () => {
        for (let index = 0; index < 10_000; index += 1) await work.observe();
      })(),
    ).rejects.toMatchObject({ code: "cancelled" });
    expect(budget.charged).toBeLessThanOrEqual(4_096);
  });
});
