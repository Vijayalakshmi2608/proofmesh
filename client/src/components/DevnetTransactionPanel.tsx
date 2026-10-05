import { useMemo, useState } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { createTransferInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { DEVNET_USDC_MINT, SOLANA_NETWORK } from "../contexts/SolanaProvider";
import { Button } from "./AppShell";
import { apiRequest, useSolanaProtocolStatus } from "../hooks/useProofMeshApi";
import { useCurrentDemoUser } from "../contexts/DemoUserContext";
import { demoTransactionId, useAppMode } from "../contexts/AppModeContext";

type TxState = "not_started" | "awaiting_wallet" | "submitted" | "confirmed" | "failed" | "recovery_required";
export function DevnetTransactionPanel({ taskId, taskTitle, amount, recipient, recipeHash, mode: transactionMode = "fund", onConfirmed }: { taskId: string; taskTitle: string; amount: number; recipient?: string; recipeHash: string; mode?: "fund" | "payout"; onConfirmed?: () => void }) {
  const { publicKey, sendTransaction } = useWallet();
  const { role } = useCurrentDemoUser();
  const { mode } = useAppMode();
  const { data: protocolStatus } = useSolanaProtocolStatus();
  const [state, setState] = useState<TxState>("not_started");
  const [signature, setSignature] = useState("");
  const connection = useMemo(() => new Connection(import.meta.env.VITE_SOLANA_RPC_URL ?? "https://api.devnet.solana.com", "confirmed"), []);
  const mint = import.meta.env.VITE_DEVNET_USDC_MINT ?? DEVNET_USDC_MINT;
  const target = recipient ?? import.meta.env.VITE_DEVNET_ESCROW_WALLET;
  const preview = { taskTitle, amount: `${amount.toLocaleString()} devnet USDC`, recipient: target || "Configured escrow wallet", tokenMint: mint, taskVersion: 1, recipeHash };
  const confirm = async () => {
    if (mode === "demo") {
      const simulatedId = demoTransactionId(taskId, transactionMode);
      setState("submitted");
      try {
        if (transactionMode === "fund") await apiRequest(`/api/tasks/${taskId}/fund`, role, { method: "POST", body: JSON.stringify({ transactionSignature: simulatedId, walletAddress: "demo-sponsor-wallet-proofmesh", network: "demo", settlementMode: "demo", tokenMint: mint, amount, taskVersion: 1, recipeHash }) });
        else await apiRequest(`/api/submissions/${taskId}/release`, role, { method: "POST", body: JSON.stringify({ payoutSignature: simulatedId, recipientWallet: "demo-contributor-wallet-proofmesh", network: "demo", settlementMode: "demo", tokenMint: mint, amount, recipeHash }) });
        setSignature(simulatedId); setState("confirmed"); toast.success("DEMO — Simulated Transaction complete"); onConfirmed?.();
      } catch (error) { setState("failed"); toast.error(error instanceof Error ? error.message : "Demo simulation failed"); }
      return;
    }
    if (!publicKey) { toast.error("Connect a Solana wallet first"); return; }
    if (!target) { toast.error("No recipient wallet is configured for this devnet action"); return; }
    setState("awaiting_wallet");
    try {
      const mintKey = new PublicKey(mint); const recipientKey = new PublicKey(target); const sourceAta = getAssociatedTokenAddressSync(mintKey, publicKey); const destinationAta = getAssociatedTokenAddressSync(mintKey, recipientKey); const sourceInfo = await connection.getAccountInfo(sourceAta); if (!sourceInfo) { setState("recovery_required"); throw new Error("Missing token account. Fund the wallet with the configured devnet test token first."); }
      const transaction = new Transaction().add(createTransferInstruction(sourceAta, destinationAta, publicKey, Math.round(amount * 1_000_000), [], undefined)); const txSignature = await sendTransaction(transaction, connection); setSignature(txSignature); setState("submitted"); await connection.confirmTransaction(txSignature, "confirmed"); setState("confirmed"); if (transactionMode === "fund") await apiRequest(`/api/tasks/${taskId}/fund`, role, { method: "POST", body: JSON.stringify({ transactionSignature: txSignature, walletAddress: publicKey.toBase58(), network: SOLANA_NETWORK, settlementMode: "devnet", tokenMint: mint, amount, taskVersion: 1, recipeHash }) }); else await apiRequest(`/api/submissions/${taskId}/release`, role, { method: "POST", body: JSON.stringify({ payoutSignature: txSignature, recipientWallet: recipientKey.toBase58(), network: SOLANA_NETWORK, settlementMode: "devnet", tokenMint: mint, amount, recipeHash }) }); toast.success("Devnet transaction confirmed"); onConfirmed?.();
    } catch (error) { if (state !== "recovery_required") setState("failed"); toast.error(error instanceof Error ? error.message : "Transaction failed or signature was rejected"); }
  };
  return <section className={`rounded-xl border p-4 ${mode === "demo" ? "border-amber-400/25 bg-amber-400/[0.06]" : "border-sky-400/20 bg-sky-400/[0.045]"}`}><div className="flex items-start justify-between gap-3"><div><div className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${mode === "demo" ? "text-amber-200" : "text-sky-200"}`}><WalletCards className="h-3.5 w-3.5" />{mode === "demo" ? "DEMO — Simulated Transaction" : `SOLANA DEVNET · ${transactionMode === "fund" ? "funding" : "payout"}`}</div><p className="mt-2 text-[11px] leading-relaxed text-slate-500">{mode === "demo" ? "No wallet, SOL, or blockchain call is used. This deterministic record is isolated from real Devnet activity." : protocolStatus?.deployed ? "The configured Anchor protocol is deployed. This panel still uses the legacy SPL transfer adapter until the generated Anchor IDL is configured; no credential claim is fabricated." : "The wallet signs a real SPL-token transfer; this is legacy settlement infrastructure, not an on-chain credential-gated escrow. The server records the confirmed Devnet signature."}</p></div>{state === "confirmed" ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : state === "failed" || state === "recovery_required" ? <AlertTriangle className="h-5 w-5 text-red-300" /> : null}</div>{mode !== "demo" && <div className={`mt-3 rounded-lg border px-3 py-2 text-[10px] ${protocolStatus?.deployed ? "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-200" : "border-amber-400/20 bg-amber-400/[0.05] text-amber-200"}`}><span className="font-semibold">{protocolStatus?.deployed ? "Anchor protocol detected" : "Anchor protocol not deployed"}</span><span className="ml-2 text-slate-400">{protocolStatus?.message ?? "Checking Devnet program status…"}</span></div>}<div className="mt-4 grid gap-2 rounded-lg border border-white/[0.07] bg-black/10 p-3 text-[10px] sm:grid-cols-2"><Preview label="Task" value={preview.taskTitle} /><Preview label="Amount" value={preview.amount} /><Preview label="Recipient" value={mode === "demo" ? "Demo ledger · no wallet" : preview.recipient} /><Preview label="Token mint" value={mode === "demo" ? "Simulated token" : preview.tokenMint} /><Preview label="Task version" value={String(preview.taskVersion)} /><Preview label="Recipe hash" value={preview.recipeHash || "Not available"} mono /></div>{(state === "failed" || state === "recovery_required") && <p className="mt-3 text-[11px] text-red-200">{state === "recovery_required" ? "Recovery required: create or fund the associated token account, then retry." : "The signature may have been rejected or the transaction failed. No payout was recorded."}</p>}<div className="mt-4 flex flex-wrap items-center gap-2"><Button onClick={confirm} disabled={state === "awaiting_wallet" || state === "submitted"}>{state === "awaiting_wallet" ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Confirm in wallet…</> : state === "submitted" ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Confirming…</> : state === "confirmed" ? "Confirmed" : mode === "demo" ? `Run simulated ${transactionMode}` : `Review & ${transactionMode === "fund" ? "fund escrow" : "release payout"}`}</Button>{signature && mode !== "demo" && <button type="button" onClick={() => window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, "_blank", "noopener,noreferrer")} className="inline-flex items-center gap-1 text-[11px] text-violet-300 hover:text-violet-200">View transaction <ExternalLink className="h-3 w-3" /></button>}{signature && mode === "demo" && <span className="font-mono text-[10px] text-amber-300">{signature}</span>}</div></section>;
}
function Preview({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) { return <div className="min-w-0"><p className="text-slate-600">{label}</p><p className={`mt-1 truncate text-slate-300 ${mono ? "font-mono text-[9px]" : ""}`}>{value}</p></div>; }
