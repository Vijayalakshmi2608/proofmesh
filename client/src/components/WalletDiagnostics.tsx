import { AlertTriangle, CheckCircle2, Copy, ExternalLink, Loader2, RefreshCw, WalletCards, Wifi, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./AppShell";
import { formatSolBalance, useSolanaWalletDiagnostics } from "../hooks/useSolanaWalletDiagnostics";

const statusCopy = {
  disconnected: "Disconnected",
  connecting: "Connecting",
  connected: "Connected",
  wrong_network: "Wrong network",
  connection_rejected: "Connection rejected",
  wallet_unavailable: "Wallet unavailable",
  rpc_unavailable: "RPC unavailable",
} as const;

export default function WalletDiagnostics() {
  const diagnostics = useSolanaWalletDiagnostics();
  const { address, status, displayNetwork, networkStatus, rpcHealthy, rpcError, balance, balanceLoading, walletInstalled, phantomWallet, adapterError, refresh, disconnect, select, connect } = diagnostics;
  const copy = async () => { if (!address) return; await navigator.clipboard?.writeText(address); toast.success("Wallet address copied"); };
  const choosePhantom = async () => {
    try {
      if (phantomWallet) await select(phantomWallet.adapter.name);
      await connect();
    } catch {
      toast.error("Phantom connection did not complete. Try again from the wallet extension.");
    }
  };
  const tone = status === "connected" ? "emerald" : status === "wrong_network" || status === "rpc_unavailable" ? "red" : status === "connecting" ? "violet" : "amber";
  const Icon = status === "connected" ? CheckCircle2 : status === "wrong_network" || status === "rpc_unavailable" ? XCircle : status === "connecting" ? Loader2 : AlertTriangle;
  return <section aria-labelledby="wallet-diagnostics-title" className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="flex items-start gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-400/10 text-violet-300"><WalletCards className="h-4 w-4" /></div><div><h2 id="wallet-diagnostics-title" className="text-[15px] font-medium text-white">Solana wallet diagnostics</h2><p className="mt-1 text-[12px] text-slate-500">Real connection and balance data from the configured Devnet RPC. No transaction is sent.</p></div></div><div className={`inline-flex items-center gap-1.5 self-start rounded-full border px-2.5 py-1 text-[10px] font-medium ${tone === "emerald" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : tone === "red" ? "border-red-400/20 bg-red-400/10 text-red-300" : tone === "violet" ? "border-violet-400/20 bg-violet-400/10 text-violet-300" : "border-amber-400/20 bg-amber-400/10 text-amber-300"}`}><Icon className={`h-3 w-3 ${status === "connecting" ? "animate-spin" : ""}`} />{statusCopy[status]}</div></div>
    {status === "wrong_network" && <div role="alert" className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-4"><p className="text-[12px] font-medium text-red-200">Phantom is reporting a non-Devnet network.</p><p className="mt-1 text-[11px] leading-relaxed text-red-200/70">Open Phantom, switch the active network to Devnet, then disconnect and reconnect. ProofMesh will not treat this wallet as Devnet.</p></div>}
    {networkStatus === "unverified" && address && <div role="status" className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-4"><p className="text-[12px] font-medium text-amber-200">Devnet target · wallet network not exposed</p><p className="mt-1 text-[11px] leading-relaxed text-amber-200/70">The configured RPC is Solana Devnet, but this Phantom adapter does not expose its active network. Switch Phantom to Devnet manually before signing any transaction.</p></div>}
    {(adapterError || status === "wallet_unavailable") && <div role="alert" className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-4"><p className="text-[12px] font-medium text-amber-200">{adapterError ?? "Phantom is not available in this browser."}</p><a className="mt-2 inline-flex items-center gap-1 text-[11px] text-violet-300 hover:text-violet-200" href="https://phantom.app/download" target="_blank" rel="noreferrer">Install Phantom <ExternalLink className="h-3 w-3" /></a></div>}
    {rpcError && <div role="alert" className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-4"><p className="text-[12px] font-medium text-red-200">Devnet RPC request failed.</p><p className="mt-1 truncate text-[11px] text-red-200/70">{rpcError}</p></div>}
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[["Wallet connection", statusCopy[status]], ["Network", displayNetwork], ["RPC status", rpcHealthy === true ? "Reachable" : rpcHealthy === false ? "Unavailable" : "Not checked"], ["Public key", address ? `${address.slice(0, 6)}…${address.slice(-6)}` : "Not connected"], ["Devnet balance", formatSolBalance(balance, balanceLoading) ]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3"><p className="text-[10px] uppercase tracking-[0.12em] text-slate-600">{label}</p><p className="mt-2 truncate font-mono text-[12px] text-slate-200">{value}</p></div>)}</div>
    <div className="mt-5 flex flex-wrap items-center gap-2">{!address ? <Button onClick={choosePhantom} disabled={status === "connecting"}>{status === "connecting" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <WalletCards className="h-3.5 w-3.5" />}Connect Phantom</Button> : <><Button variant="secondary" onClick={copy}><Copy className="h-3.5 w-3.5" />Copy address</Button><Button variant="secondary" onClick={() => void refresh()} disabled={balanceLoading}><RefreshCw className={`h-3.5 w-3.5 ${balanceLoading ? "animate-spin" : ""}`} />Refresh balance</Button><Button variant="ghost" onClick={() => void disconnect()}>Disconnect</Button></>}<span className="ml-auto inline-flex items-center gap-1 text-[10px] text-slate-600"><Wifi className="h-3 w-3" />SOLANA DEVNET · TEST NETWORK — NO REAL VALUE</span></div>
  </section>;
}
