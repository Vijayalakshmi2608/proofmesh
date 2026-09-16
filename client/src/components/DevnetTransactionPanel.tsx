import { useMemo, useState } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { createTransferInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { DEVNET_USDC_MINT, SOLANA_NETWORK } from "../contexts/SolanaProvider";
import { Button } from "./AppShell";
import { apiRequest } from "../hooks/useProofMeshApi";
import { useCurrentDemoUser } from "../contexts/DemoUserContext";

type TxState = "not_started" | "awaiting_wallet" | "submitted" | "confirmed" | "failed" | "recovery_required";
export function DevnetTransactionPanel({ taskId, taskTitle, amount, recipient, recipeHash, mode = "fund", onConfirmed }: { taskId: string; taskTitle: string; amount: number; recipient?: string; recipeHash: string; mode?: "fund" | "payout"; onConfirmed?: () => void }) {
  const { publicKey, sendTransaction } = useWallet();
  const { role } = useCurrentDemoUser();
  const [state, setState] = useState<TxState>("not_started");
  const [signature, setSignature] = useState("");
  const connection = useMemo(() => new Connection(import.meta.env.VITE_SOLANA_RPC_URL ?? "https://api.devnet.solana.com", "confirmed"), []);
  const mint = import.meta.env.VITE_DEVNET_USDC_MINT ?? DEVNET_USDC_MINT;
  const target = recipient ?? import.meta.env.VITE_DEVNET_ESCROW_WALLET;
  const preview = { taskTitle, amount: `${amount.toLocaleString()} devnet USDC`, recipient: target || "Configured escrow wallet", tokenMint: mint, taskVersion: 1, recipeHash };
  const confirm = async () => {
    if (!publicKey) { toast.error("Connect a Solana wallet first"); return; }
    if (!target) { toast.error("No recipient wallet is configured for this devnet action"); return; }
    setState("awaiting_wallet");
    try {
      const mintKey = new PublicKey(mint); const recipientKey = new PublicKey(target); const sourceAta = getAssociatedTokenAddressSync(mintKey, publicKey); const destinationAta = getAssociatedTokenAddressSync(mintKey, recipientKey); const sourceInfo = await connection.getAccountInfo(sourceAta); if (!sourceInfo) { setState("recovery_required"); throw new Error("Missing token account. Fund the wallet with the configured devnet test token first."); }
      const transaction = new Transaction().add(createTransferInstruction(sourceAta, destinationAta, publicKey, Math.round(amount * 1_000_000), [], undefined)); const txSignature = await sendTransaction(transaction, connection); setSignature(txSignature); setState("submitted"); await connection.confirmTransaction(txSignature, "confirmed"); setState("confirmed"); if (mode === "fund") await apiRequest(`/api/tasks/${taskId}/fund`, role, { method: "POST", body: JSON.stringify({ transactionSignature: txSignature, walletAddress: publicKey.toBase58(), network: SOLANA_NETWORK, tokenMint: mint, amount, taskVersion: 1, recipeHash }) }); else await apiRequest(`/api/submissions/${taskId}/release`, role, { method: "POST", body: JSON.stringify({ payoutSignature: txSignature, recipientWallet: recipientKey.toBase58(), network: SOLANA_NETWORK, tokenMint: mint, amount, recipeHash }) }); toast.success("Devnet transaction confirmed"); onConfirmed?.();
    } catch (error) { if (state !== "recovery_required") setState("failed"); toast.error(error instanceof Error ? error.message : "Transaction failed or signature was rejected"); }
  };
  return <section className="rounded-xl border border-amber-400/20 bg-amber-400/[0.045] p-4"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-200"><WalletCards className="h-3.5 w-3.5" /> Solana Devnet {mode === "fund" ? "funding" : "payout"}</div><p className="mt-2 text-[11px] leading-relaxed text-slate-500">Transparent prototype flow: the wallet signs the configured SPL-token transfer; the server records the confirmed signature and policy hash.</p></div>{state === "confirmed" ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : state === "failed" || state === "recovery_required" ? <AlertTriangle className="h-5 w-5 text-red-300" /> : null}</div><div className="mt-4 grid gap-2 rounded-lg border border-white/[0.07] bg-black/10 p-3 text-[10px] sm:grid-cols-2"><Preview label="Task" value={preview.taskTitle} /><Preview label="Amount" value={preview.amount} /><Preview label="Recipient" value={preview.recipient} /><Preview label="Token mint" value={preview.tokenMint} /><Preview label="Task version" value={String(preview.taskVersion)} /><Preview label="Recipe hash" value={preview.recipeHash || "Not available"} mono /></div>{(state === "failed" || state === "recovery_required") && <p className="mt-3 text-[11px] text-red-200">{state === "recovery_required" ? "Recovery required: create or fund the associated token account, then retry." : "The signature may have been rejected or the transaction failed. No payout was recorded."}</p>}<div className="mt-4 flex flex-wrap items-center gap-2"><Button onClick={confirm} disabled={state === "awaiting_wallet" || state === "submitted"}>{state === "awaiting_wallet" ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Confirm in wallet…</> : state === "submitted" ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Confirming…</> : state === "confirmed" ? "Confirmed" : `Review & ${mode === "fund" ? "fund escrow" : "release payout"}`}</Button>{signature && <button type="button" onClick={() => window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, "_blank", "noopener,noreferrer")} className="inline-flex items-center gap-1 text-[11px] text-violet-300 hover:text-violet-200">View transaction <ExternalLink className="h-3 w-3" /></button>}</div></section>;
}
function Preview({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) { return <div className="min-w-0"><p className="text-slate-600">{label}</p><p className={`mt-1 truncate text-slate-300 ${mono ? "font-mono text-[9px]" : ""}`}>{value}</p></div>; }
