import { describe, expect, it } from "vitest";
import { Connection } from "@solana/web3.js";
import { classifyWalletNetwork, deriveWalletDiagnosticStatus, formatSolBalance, walletErrorMessage } from "./useSolanaWalletDiagnostics";

describe("Solana wallet diagnostics", () => {
  it("classifies disconnected and explicit network states without guessing", () => {
    expect(classifyWalletNetwork(undefined)).toBe("unverified");
    expect(classifyWalletNetwork("devnet")).toBe("devnet");
    expect(classifyWalletNetwork("mainnet-beta")).toBe("wrong_network");
  });

  it("formats unavailable and real balance states", () => {
    expect(formatSolBalance(null)).toBe("Unavailable");
    expect(formatSolBalance(null, true)).toBe("Loading…");
    expect(formatSolBalance(1.23456)).toBe("1.2346 SOL");
  });

  it("derives every user-visible wallet state without guessing", () => {
    const base = { connecting: false, connected: false, adapterError: null, walletInstalled: true, networkStatus: "unverified" as const, rpcHealthy: null };
    expect(deriveWalletDiagnosticStatus(base)).toBe("disconnected");
    expect(deriveWalletDiagnosticStatus({ ...base, connecting: true })).toBe("connecting");
    expect(deriveWalletDiagnosticStatus({ ...base, walletInstalled: false })).toBe("wallet_unavailable");
    expect(deriveWalletDiagnosticStatus({ ...base, adapterError: "Connection was rejected in Phantom." })).toBe("connection_rejected");
    expect(deriveWalletDiagnosticStatus({ ...base, connected: true, networkStatus: "wrong_network" })).toBe("wrong_network");
    expect(deriveWalletDiagnosticStatus({ ...base, connected: true, rpcHealthy: false })).toBe("rpc_unavailable");
    expect(deriveWalletDiagnosticStatus({ ...base, connected: true, rpcHealthy: true })).toBe("connected");
    expect(walletErrorMessage(new Error("User rejected the request") as never)).toContain("rejected");
  });

  it("reaches the configured Solana Devnet RPC with a lightweight request", async () => {
    const endpoint = process.env.VITE_SOLANA_RPC_URL || "https://api.devnet.solana.com";
    const version = await new Connection(endpoint, "confirmed").getVersion();
    expect(version).toHaveProperty("solana-core");
  }, 20_000);
});
