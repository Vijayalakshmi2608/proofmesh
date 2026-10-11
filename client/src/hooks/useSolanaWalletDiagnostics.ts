import { useCallback, useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState, type WalletError } from "@solana/wallet-adapter-base";

export type WalletNetworkStatus = "devnet" | "wrong_network" | "unverified";
export type WalletDiagnosticStatus = "disconnected" | "connecting" | "connected" | "wrong_network" | "connection_rejected" | "wallet_unavailable" | "rpc_unavailable";

export function classifyWalletNetwork(network: unknown): WalletNetworkStatus {
  if (typeof network !== "string" || network.trim() === "") return "unverified";
  const normalized = network.toLowerCase().replace(/[-_\s]/g, "");
  return normalized === "devnet" ? "devnet" : "wrong_network";
}

export function getWalletProviderNetwork(): unknown {
  if (typeof window === "undefined") return undefined;
  const provider = (window as Window & { phantom?: { solana?: { network?: unknown } }; solana?: { network?: unknown } }).phantom?.solana ?? (window as Window & { solana?: { network?: unknown } }).solana;
  return provider?.network;
}

export function walletErrorMessage(error: WalletError | null): string | null {
  if (!error) return null;
  const message = error.message?.toLowerCase() ?? "";
  if (message.includes("reject") || message.includes("cancel") || message.includes("declin")) return "Connection was rejected in Phantom. Try connecting again when ready.";
  if (message.includes("not ready") || message.includes("not installed")) return "Phantom is not installed or available in this browser.";
  return error.message || "Wallet connection failed. Try again.";
}

function asWalletError(value: unknown): WalletError {
  if (value instanceof Error) return value as WalletError;
  const message = typeof value === "object" && value !== null && "message" in value && typeof value.message === "string" ? value.message : "Wallet connection failed. Try again.";
  return Object.assign(new Error(message), { name: "WalletConnectionError" }) as WalletError;
}

export function deriveWalletDiagnosticStatus(input: { connecting: boolean; connected: boolean; adapterError: string | null; walletInstalled: boolean | undefined; networkStatus: WalletNetworkStatus; rpcHealthy: boolean | null }): WalletDiagnosticStatus {
  if (input.connecting) return "connecting";
  if (input.adapterError && !input.connected) return input.adapterError.includes("rejected") ? "connection_rejected" : input.walletInstalled === false ? "wallet_unavailable" : "connection_rejected";
  if (!input.connected) return input.walletInstalled === false ? "wallet_unavailable" : "disconnected";
  if (input.networkStatus === "wrong_network") return "wrong_network";
  if (input.rpcHealthy === false) return "rpc_unavailable";
  return "connected";
}

export function useSolanaWalletDiagnostics() {
  const { connection } = useConnection();
  const { publicKey, connected, connecting, wallet, wallets, select, connect, disconnect } = useWallet();
  const [walletError, setWalletError] = useState<WalletError | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [rpcHealthy, setRpcHealthy] = useState<boolean | null>(null);
  const [rpcError, setRpcError] = useState<string | null>(null);
  const [providerNetwork, setProviderNetwork] = useState<unknown>(() => getWalletProviderNetwork());
  const address = publicKey?.toBase58() ?? null;
  const phantomWallet = useMemo(() => wallets.find((item) => item.adapter.name.toLowerCase() === "phantom"), [wallets]);
  const walletInstalled = phantomWallet?.readyState === WalletReadyState.Installed;
  const networkStatus = classifyWalletNetwork(providerNetwork);
  const adapterError = walletErrorMessage(walletError);

  const refresh = useCallback(async () => {
    if (!publicKey) {
      setBalance(null);
      setRpcHealthy(null);
      setRpcError(null);
      return;
    }
    setBalanceLoading(true);
    setRpcError(null);
    try {
      const [lamports] = await Promise.all([connection.getBalance(publicKey, "confirmed"), connection.getLatestBlockhash("confirmed")]);
      setBalance(lamports / 1_000_000_000);
      setRpcHealthy(true);
    } catch (cause) {
      setBalance(null);
      setRpcHealthy(false);
      setRpcError(cause instanceof Error ? cause.message : "Devnet RPC request failed.");
    } finally {
      setBalanceLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    const provider = (typeof window !== "undefined" ? (window as Window & { phantom?: { solana?: { on?: (event: string, handler: () => void) => void; off?: (event: string, handler: () => void) => void; network?: unknown } } }).phantom?.solana : undefined);
    if (!provider?.on) return;
    const handleNetwork = () => setProviderNetwork(provider.network);
    provider.on("connect", handleNetwork);
    provider.on("disconnect", handleNetwork);
    return () => { provider.off?.("connect", handleNetwork); provider.off?.("disconnect", handleNetwork); };
  }, [connected]);
  useEffect(() => {
    const adapter = wallet?.adapter;
    if (!adapter) return;
    const handleError = (nextError: WalletError) => setWalletError(nextError);
    adapter.on("error", handleError);
    return () => { adapter.off("error", handleError); };
  }, [wallet]);
  useEffect(() => {
    const handleProviderError = (event: Event) => {
      setWalletError(asWalletError((event as CustomEvent<unknown>).detail));
    };
    window.addEventListener("proofmesh:wallet-error", handleProviderError);
    return () => window.removeEventListener("proofmesh:wallet-error", handleProviderError);
  }, []);

  const status = deriveWalletDiagnosticStatus({ connecting, connected, adapterError, walletInstalled, networkStatus, rpcHealthy });
  const displayNetwork = networkStatus === "devnet" ? "Solana Devnet" : networkStatus === "wrong_network" ? "Wrong network" : "Devnet target · wallet network unverified";

  return { address, publicKey, connected, connecting, wallet, wallets, phantomWallet, walletInstalled, walletError, adapterError, balance, balanceLoading, rpcHealthy, rpcError, networkStatus, displayNetwork, status, refresh, select, connect, disconnect };
}

export function formatSolBalance(balance: number | null, loading = false) {
  if (loading) return "Loading…";
  if (balance === null) return "Unavailable";
  return `${balance.toFixed(4)} SOL`;
}
