import { describe, expect, it } from "vitest";
import { appModes, demoTransactionId } from "./AppModeContext";

describe("ProofMesh application modes", () => {
  it("exposes only demo and devnet modes", () => {
    expect(appModes).toEqual(["demo", "devnet"]);
  });

  it("creates deterministic identifiers that cannot be mistaken for Solana signatures", () => {
    expect(demoTransactionId("task-002", "fund")).toBe("demo-tx-task-002-fund");
    expect(demoTransactionId("sub-002", "payout")).toBe("demo-tx-sub-002-payout");
    expect(demoTransactionId("task-002", "fund")).not.toMatch(/^[1-9A-HJ-NP-Za-km-z]{32,}$/);
  });
});
