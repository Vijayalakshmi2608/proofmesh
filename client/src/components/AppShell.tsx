import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCurrentDemoUser } from "../contexts/DemoUserContext";
import { useAppMode } from "../contexts/AppModeContext";
import { SOLANA_NETWORK } from "../contexts/SolanaProvider";
import { useSolanaWalletDiagnostics } from "../hooks/useSolanaWalletDiagnostics";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Bot,
  Bell,
  Blocks,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  CircleHelp,
  Clock3,
  Command,
  Copy,
  ExternalLink,
  FileCheck2,
  FileCode2,
  Filter,
  Github,
  GitBranch,
  Hash,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Loader2,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  UserRound,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import type { ActivityEvent, EvidenceItem, ProofReceipt, Submission, Task, TaskStatus } from "../lib/types";
import { activity } from "../lib/mockData";
import { cn } from "../lib/utils";

export const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tasks", href: "/tasks", icon: ListChecks },
  { label: "Submissions", href: "/submissions/sub-001", icon: Inbox },
  { label: "Proof receipts", href: "/proofs", icon: BadgeCheck },
  { label: "Proof-to-Access", href: "/access", icon: ShieldCheck },
  { label: "Proof Graph", href: "/graph", icon: GitBranch },
  { label: "Agent demo", href: "/agents", icon: Bot },
];

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="brand-mark flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#8077ff] text-white shadow-[0_0_24px_rgba(128,119,255,0.24)]">
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
          <path d="M5 5.5h7.2A2.8 2.8 0 0 1 15 8.3v0A2.8 2.8 0 0 1 12.2 11H7.8A2.8 2.8 0 0 0 5 13.8v0A2.8 2.8 0 0 0 7.8 16H15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M5 5.5v2.4M15 12.1v3.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </div>
      {!compact && <span className="text-[15px] font-semibold tracking-[-0.02em] text-white">ProofMesh</span>}
    </div>
  );
}

export function WalletButton() {
  const { publicKey, connected, connecting, disconnect, select, connect, wallets, wallet, adapterError, walletInstalled, networkStatus } = useSolanaWalletDiagnostics();
  const { mode } = useAppMode();
  const { setVisible } = useWalletModal();
  const address = publicKey?.toBase58();
  const shortAddress = address ? `${address.slice(0, 4)}…${address.slice(-4)}` : "Connect wallet";
  const copyAddress = async () => { if (!address) return; await navigator.clipboard?.writeText(address); toast.success("Wallet address copied"); };
  const connectWallet = async () => {
    try {
      const phantom = wallets.find((item) => item.adapter.name.toLowerCase() === "phantom");
      if (!phantom || !walletInstalled) { toast.error("Phantom is not installed or available in this browser."); return; }
      await select(phantom.adapter.name);
      await connect();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Phantom connection rejected. Try again.");
    }
  };
  return (
    <div className="flex items-center gap-1"><span className={`hidden rounded-md border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] sm:inline-flex ${mode === "demo" ? "border-amber-400/20 bg-amber-400/[0.06] text-amber-200" : networkStatus === "wrong_network" ? "border-red-400/20 bg-red-400/[0.06] text-red-200" : "border-sky-400/20 bg-sky-400/[0.06] text-sky-200"}`}>{mode === "demo" ? "Demo Mode" : networkStatus === "wrong_network" ? "Wrong network" : `Solana ${SOLANA_NETWORK}`}</span><button type="button" onClick={() => { if (connected) { disconnect().catch(() => toast.error("Wallet disconnect failed")); } else if (wallet) { void connectWallet(); } else { setVisible(true); } }} className="group inline-flex h-9 items-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.035] px-3 text-[12px] font-medium text-slate-200 transition hover:border-violet-400/30 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-violet-400/60" aria-label={connected ? "Disconnect wallet" : "Connect wallet"} title={mode === "demo" ? "Demo Mode never sends blockchain transactions" : adapterError ?? "Connect Phantom on Solana Devnet"}><span className={`h-1.5 w-1.5 rounded-full ${mode === "demo" ? "bg-amber-400" : connected && networkStatus !== "wrong_network" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : networkStatus === "wrong_network" ? "bg-red-400" : "bg-slate-600"}`} /><span className="font-mono text-[11px]">{mode === "demo" ? "Demo only" : connecting ? "Connecting…" : shortAddress}</span><ChevronDown className="h-3.5 w-3.5 text-slate-500 transition group-hover:text-slate-300" /></button>{connected && <button type="button" onClick={copyAddress} className="sr-only">Copy wallet address</button>}</div>
  );
}

export function StatusBadge({ status, className }: { status: TaskStatus | Submission["status"] | ProofReceipt["status"]; className?: string }) {
  const config: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
    active: { label: "Active", className: "status-active", icon: Zap },
    in_review: { label: "In review", className: "status-review", icon: Clock3 },
    verified: { label: "Verified", className: "status-verified", icon: CheckCircle2 },
    settled: { label: "Settled", className: "status-verified", icon: CheckCircle2 },
    draft: { label: "Draft", className: "status-draft", icon: FileCode2 },
    pending: { label: "Pending", className: "status-review", icon: Clock3 },
    needs_changes: { label: "Needs changes", className: "status-danger", icon: X },
    rejected: { label: "Rejected", className: "status-danger", icon: X },
    issued: { label: "Issued", className: "status-verified", icon: BadgeCheck },
    revoked: { label: "Revoked", className: "status-danger", icon: X },
    expired: { label: "Expired", className: "status-danger", icon: X },
  };
  const item = config[status] ?? config.pending;
  const Icon = item.icon;
  return (
    <span className={cn("status-badge", item.className, className)}>
      <Icon className="h-3 w-3" /> {item.label}
    </span>
  );
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  return (
    <>
      {open && <button aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-30 bg-black/60 lg:hidden" />}
      <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-white/[0.07] bg-[#0b0d12] px-3 py-4 transition-transform duration-200 ease-out lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between px-2 pb-7">
          <Link to="/dashboard" onClick={onClose} aria-label="ProofMesh overview"><BrandMark /></Link>
          <button type="button" onClick={onClose} aria-label="Close navigation" className="rounded-md p-1.5 text-slate-500 hover:bg-white/[0.06] hover:text-slate-200 lg:hidden"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-2 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Workspace</div>
        <nav className="space-y-1" aria-label="Main navigation">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = location.pathname === href || (href === "/tasks" && location.pathname.startsWith("/tasks/")) || (href === "/proofs" && location.pathname.startsWith("/proofs/"));
            return <NavLink key={href} to={href} onClick={onClose} className={cn("group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition", active ? "bg-white/[0.075] text-white shadow-[inset_2px_0_0_#8077ff]" : "text-slate-500 hover:bg-white/[0.045] hover:text-slate-200")}>
              <Icon className={cn("h-[17px] w-[17px]", active ? "text-[#9d97ff]" : "text-slate-600 group-hover:text-slate-400")} />
              <span>{label}</span>
              {label === "Submissions" && <span className="ml-auto rounded-full bg-amber-400/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-300">1</span>}
            </NavLink>;
          })}
        </nav>
        <div className="mt-8 px-2 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Workspace tools</div>
        <nav className="space-y-1">
          <NavLink to="/settings" onClick={onClose} className={({ isActive }) => cn("group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition", isActive ? "bg-white/[0.075] text-white" : "text-slate-500 hover:bg-white/[0.045] hover:text-slate-200")}><Settings className="h-[17px] w-[17px] text-slate-600 group-hover:text-slate-400" /><span>Settings</span></NavLink>
          <NavLink to="/demo" onClick={onClose} className={({ isActive }) => cn("group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition", isActive ? "bg-white/[0.075] text-white" : "text-slate-500 hover:bg-white/[0.045] hover:text-slate-200")}><BookOpen className="h-[17px] w-[17px] text-slate-600 group-hover:text-slate-400" /><span>Demo Guide</span></NavLink>
          <button type="button" onClick={() => toast.info("Help center is coming soon")} className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-slate-500 transition hover:bg-white/[0.045] hover:text-slate-200"><CircleHelp className="h-[17px] w-[17px] text-slate-600 group-hover:text-slate-400" /><span>Help center</span></button>
        </nav>
        <div className="mt-auto rounded-xl border border-violet-400/15 bg-[linear-gradient(135deg,rgba(128,119,255,0.13),rgba(128,119,255,0.02))] p-3.5">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-violet-200"><Sparkles className="h-3.5 w-3.5" /> ProofMesh beta</div>
          <p className="text-[11px] leading-relaxed text-slate-500">Outcome-bound settlement for teams that ship in public.</p>
          <button type="button" onClick={() => toast.success("Feedback link copied")} className="mt-3 text-[11px] font-medium text-violet-300 hover:text-violet-200">Share feedback <ArrowUpRight className="ml-0.5 inline h-3 w-3" /></button>
        </div>
        <div className="mt-3 flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 hover:bg-white/[0.035]">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-[10px] font-semibold text-slate-200">AR</div>
          <div className="min-w-0"><p className="truncate text-[12px] font-medium text-slate-300">Alex Rivera</p><p className="truncate text-[10px] text-slate-600">Sponsor · helius.dev</p></div>
          <MoreHorizontal className="ml-auto h-4 w-4 text-slate-600" />
        </div>
      </aside>
    </>
  );
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const actions = [
    { label: "Open overview", hint: "Navigate", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Create new task", hint: "Navigate", icon: Plus, href: "/tasks/new" },
    { label: "Review submissions", hint: "Navigate", icon: FileCheck2, href: "/submissions/sub-001" },
    { label: "View proof receipts", hint: "Navigate", icon: BadgeCheck, href: "/proofs" },
    { label: "Open Proof Graph", hint: "Navigate", icon: GitBranch, href: "/graph" },
    { label: "Open Demo Guide", hint: "Navigate", icon: BookOpen, href: "/demo" },
  ];
  const filtered = actions.filter((action) => action.label.toLowerCase().includes(query.toLowerCase()));
  useEffect(() => { if (!open) setQuery(""); }, [open]);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-[14vh] backdrop-blur-sm" onMouseDown={onClose}>
    <div role="dialog" aria-modal="true" aria-label="Command palette" className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.1] bg-[#11141b] shadow-2xl shadow-black/50" onMouseDown={(event) => event.stopPropagation()}>
      <div className="flex items-center gap-3 border-b border-white/[0.07] px-4"><Search className="h-4 w-4 text-slate-500" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ProofMesh…" className="h-12 flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600" /><kbd className="rounded border border-white/[0.09] px-1.5 py-0.5 font-mono text-[10px] text-slate-600">ESC</kbd></div>
      <div className="p-2"><p className="px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Quick actions</p>{filtered.map(({ label, hint, icon: Icon, href }) => <button key={href} onClick={() => { navigate(href); onClose(); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] text-slate-300 transition hover:bg-white/[0.07] hover:text-white"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.06] text-slate-400"><Icon className="h-3.5 w-3.5" /></span><span>{label}</span><span className="ml-auto text-[11px] text-slate-600">{hint}</span></button>)}{filtered.length === 0 && <p className="px-3 py-5 text-center text-sm text-slate-600">No matching actions</p>}</div>
      <div className="flex items-center gap-4 border-t border-white/[0.07] px-4 py-2 text-[10px] text-slate-600"><span><kbd className="mr-1 rounded border border-white/[0.08] px-1">↑↓</kbd> to navigate</span><span><kbd className="mr-1 rounded border border-white/[0.08] px-1">↵</kbd> to select</span></div>
    </div>
  </div>;
}

export function Topbar({ onMenu, onCommand }: { onMenu: () => void; onCommand: () => void }) {
  const { role, user, setRole } = useCurrentDemoUser();
  const { mode, setMode } = useAppMode();
  const roleLabel = role.replace("_", " ");
  return <header className="sticky top-0 z-20 flex h-[65px] items-center border-b border-white/[0.07] bg-[#0b0d12]/90 px-4 backdrop-blur-xl sm:px-6 lg:ml-[248px] lg:px-8">
    <button onClick={onMenu} aria-label="Open navigation" className="mr-3 rounded-lg p-2 text-slate-500 hover:bg-white/[0.06] hover:text-slate-200 lg:hidden"><Menu className="h-5 w-5" /></button>
    <button type="button" onClick={onCommand} className="hidden h-9 min-w-[220px] items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 text-left text-[12px] text-slate-600 transition hover:border-white/[0.12] hover:text-slate-400 sm:flex"><Search className="h-3.5 w-3.5" /><span>Search anything…</span><kbd className="ml-auto rounded border border-white/[0.08] px-1.5 py-0.5 font-mono text-[10px] text-slate-600">⌘ K</kbd></button>
    <button type="button" onClick={onCommand} aria-label="Search" className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.06] hover:text-slate-200 sm:hidden"><Search className="h-4 w-4" /></button>
    <div className="ml-auto flex items-center gap-2.5"><div className="hidden items-center rounded-lg border border-white/[0.08] bg-white/[0.025] p-0.5 md:flex" aria-label="Application mode"><button type="button" onClick={() => { setMode("demo"); toast.success("Demo Mode enabled — simulated blockchain activity"); }} aria-pressed={mode === "demo"} className={`rounded-md px-2 py-1 text-[10px] font-medium transition ${mode === "demo" ? "bg-amber-400/15 text-amber-200" : "text-slate-600 hover:text-slate-300"}`}>Demo Mode</button><button type="button" onClick={() => { setMode("devnet"); toast.info("Real Devnet Mode enabled — connect Phantom to continue"); }} aria-pressed={mode === "devnet"} className={`rounded-md px-2 py-1 text-[10px] font-medium transition ${mode === "devnet" ? "bg-sky-400/15 text-sky-200" : "text-slate-600 hover:text-slate-300"}`}>Real Devnet</button></div><span className={`hidden rounded-md border px-2 py-1 text-[10px] font-medium capitalize sm:inline-flex ${mode === "demo" ? "border-amber-400/20 bg-amber-400/[0.07] text-amber-200" : "border-sky-400/20 bg-sky-400/[0.07] text-sky-200"}`}>{mode === "demo" ? "Demo · simulated" : "Devnet · real testnet"} · {roleLabel}</span><label className="sr-only" htmlFor="demo-role">Demo role</label><select id="demo-role" value={role} onChange={(event) => { setRole(event.target.value as typeof role); toast.success(`Switched to ${event.target.value.replace("_", " ")} demo role`); }} aria-label="Switch demo role" className="block h-8 max-w-[98px] rounded-lg border border-white/[0.08] bg-white/[0.035] px-1.5 text-[10px] capitalize text-slate-400 outline-none hover:border-violet-400/25 sm:max-w-none sm:px-2"><option value="sponsor">Sponsor</option><option value="contributor">Contributor</option><option value="reviewer">Reviewer</option><option value="public_verifier">Public verifier</option></select><button type="button" aria-label="Notifications" onClick={() => toast.info("No new notifications")} className="relative rounded-lg p-2 text-slate-500 hover:bg-white/[0.06] hover:text-slate-200"><Bell className="h-4 w-4" /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-violet-400" /></button><WalletButton /></div>
  </header>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const { mode } = useAppMode();
  useEffect(() => { const handleKey = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setCommandOpen(true); } }; window.addEventListener("keydown", handleKey); return () => window.removeEventListener("keydown", handleKey); }, []);
  return <div className="min-h-screen bg-[#090b0f] text-slate-200"><Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} /><Topbar onMenu={() => setMobileNavOpen(true)} onCommand={() => setCommandOpen(true)} /><CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} /><main className="min-h-[calc(100vh-65px)] lg:ml-[248px]"><div className={`border-b px-4 py-2 text-[11px] sm:px-6 lg:px-10 ${mode === "demo" ? "border-amber-400/15 bg-amber-400/[0.045] text-amber-200" : "border-sky-400/15 bg-sky-400/[0.045] text-sky-200"}`} role="status">{mode === "demo" ? "Demo Mode — simulated blockchain activity. No wallet or real funds required." : "Solana Devnet — real testnet transactions. Connect Phantom; never use mainnet funds."}</div><div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-9">{children}</div></main></div>;
}

export function PageHeader({ eyebrow, title, description, actions, backHref }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode; backHref?: string }) {
  return <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div>{backHref && <Link to={backHref} className="mb-4 inline-flex items-center gap-1.5 text-[12px] text-slate-500 transition hover:text-slate-200"><ArrowLeft className="h-3.5 w-3.5" /> Back</Link>}{eyebrow && <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300/80"><span className="h-1.5 w-1.5 rounded-full bg-violet-400" />{eyebrow}</div>}<h1 className="text-[28px] font-semibold tracking-[-0.04em] text-white sm:text-[32px]">{title}</h1>{description && <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-slate-500">{description}</p>}</div>{actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}</div>;
}

export function Button({ children, variant = "primary", className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  return <button {...props} className={cn("inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-[12px] font-medium transition active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-violet-400/60 disabled:cursor-not-allowed disabled:opacity-50", variant === "primary" && "bg-[#8077ff] text-white shadow-[0_4px_18px_rgba(128,119,255,0.18)] hover:bg-[#9189ff]", variant === "secondary" && "border border-white/[0.1] bg-white/[0.035] text-slate-300 hover:bg-white/[0.07] hover:text-white", variant === "ghost" && "text-slate-500 hover:bg-white/[0.06] hover:text-slate-200", variant === "danger" && "border border-red-400/20 bg-red-400/10 text-red-300 hover:bg-red-400/15", className)}>{children}</button>;
}

export function MetricCard({ label, value, detail, icon: Icon, accent = "violet" }: { label: string; value: string; detail: ReactNode; icon: typeof Blocks; accent?: "violet" | "emerald" | "amber" | "blue" }) {
  const colors = { violet: "text-violet-300 bg-violet-400/10", emerald: "text-emerald-300 bg-emerald-400/10", amber: "text-amber-300 bg-amber-400/10", blue: "text-sky-300 bg-sky-400/10" };
  return <div className="panel group p-4 transition hover:border-white/[0.13] hover:bg-white/[0.04] sm:p-5"><div className="mb-4 flex items-start justify-between"><p className="text-[11px] font-medium text-slate-500">{label}</p><div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", colors[accent])}><Icon className="h-3.5 w-3.5" /></div></div><p className="text-[25px] font-semibold tracking-[-0.04em] text-white">{value}</p><div className="mt-1 text-[11px] text-slate-600">{detail}</div></div>;
}

export function TaskCard({ task }: { task: Task }) {
  const progress = Math.round((task.submissions / task.maxSubmissions) * 100);
  return <Link to={`/tasks/${task.id}`} className="panel group block p-5 transition duration-200 hover:-translate-y-0.5 hover:border-violet-400/25 hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-violet-400/60"><div className="mb-5 flex items-start justify-between gap-4"><div className="flex min-w-0 items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-violet-300"><TerminalSquare className="h-4 w-4" /></div><div className="min-w-0"><div className="mb-1 flex items-center gap-2"><span className="truncate text-[10px] font-mono uppercase tracking-[0.12em] text-slate-600">{task.project}</span><span className="h-1 w-1 rounded-full bg-slate-700" /><span className="font-mono text-[10px] text-slate-600">{task.id}</span></div><h3 className="truncate text-[14px] font-medium text-slate-100 group-hover:text-white">{task.title}</h3></div></div><StatusBadge status={task.status} /></div><p className="mb-5 line-clamp-2 min-h-[38px] text-[12px] leading-relaxed text-slate-500">{task.summary}</p><div className="flex flex-wrap gap-1.5">{task.tags.map((tag) => <span key={tag} className="rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[10px] text-slate-500">{tag}</span>)}</div><div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4 text-[11px]"><span className="flex items-center gap-1.5 text-slate-500"><CircleDollarSign className="h-3.5 w-3.5 text-emerald-400/80" /><strong className="font-medium text-slate-300">{task.reward.toLocaleString()} USDC</strong></span><span className="flex items-center gap-1.5 text-slate-600"><Clock3 className="h-3.5 w-3.5" />Due {task.dueDate.replace(", 2026", "")}</span></div><div className="mt-3 flex items-center gap-2"><div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]"><div className={cn("h-full rounded-full", task.status === "verified" ? "bg-emerald-400" : "bg-violet-400")} style={{ width: `${Math.max(progress, 8)}%` }} /></div><span className="font-mono text-[10px] text-slate-600">{task.submissions}/{task.maxSubmissions}</span></div></Link>;
}

export function TaskStatusTimeline({ task }: { task: Task }) {
  const steps = [
    { label: "Task created", detail: task.createdAt, done: true },
    { label: "Escrow funded", detail: "2,400 USDC locked", done: true },
    { label: "Evidence submitted", detail: task.submissions ? `${task.submissions} submission${task.submissions > 1 ? "s" : ""}` : "Waiting for contributor", done: task.submissions > 0 },
    { label: "Human review", detail: task.status === "in_review" ? "Awaiting reviewer" : task.status === "verified" ? "Approved" : "Not started", done: task.status === "verified" || task.status === "settled" },
    { label: "Payment settled", detail: task.status === "verified" || task.status === "settled" ? "On-chain settlement complete" : "Pending verification", done: task.status === "settled" },
  ];
  return <div className="space-y-0">{steps.map((step, index) => <div key={step.label} className="flex gap-3"><div className="flex flex-col items-center"><div className={cn("relative z-10 flex h-6 w-6 items-center justify-center rounded-full border", step.done ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-white/[0.1] bg-white/[0.035] text-slate-600")}>{step.done ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}</div>{index < steps.length - 1 && <div className={cn("h-9 w-px", step.done ? "bg-emerald-400/25" : "bg-white/[0.08]")} />}</div><div className="pb-5"><p className={cn("text-[12px] font-medium", step.done ? "text-slate-200" : "text-slate-500")}>{step.label}</p><p className="mt-0.5 text-[11px] text-slate-600">{step.detail}</p></div></div>)}</div>;
}

export function VerificationChecklist({ task, compact = false }: { task: Task; compact?: boolean }) {
  return <div className={cn("space-y-2", compact && "space-y-1.5")}>{task.acceptance.map((criterion) => <div key={criterion.id} className={cn("flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.018] px-3 py-3", compact && "px-2.5 py-2")}><div className={cn("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full", criterion.passed ? "bg-emerald-400/15 text-emerald-300" : "bg-white/[0.07] text-slate-600")}>{criterion.passed ? <Check className="h-2.5 w-2.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}</div><div className="min-w-0"><p className={cn("text-[12px] font-medium", criterion.passed ? "text-slate-300" : "text-slate-400")}>{criterion.label}</p>{!compact && <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{criterion.description}</p>}</div></div>)}</div>;
}

const evidenceIcons = { repository: Github, preview: ExternalLink, benchmark: Zap, document: FileCode2 };
export function EvidenceCard({ evidence }: { evidence: EvidenceItem }) {
  const Icon = evidenceIcons[evidence.type];
  return <a href={evidence.href} onClick={(event) => { if (evidence.href === "#") { event.preventDefault(); toast.info("External evidence link is mocked"); } }} className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 transition hover:border-white/[0.14] hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-violet-400/50"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-slate-400"><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-medium text-slate-300 group-hover:text-white">{evidence.title}</p><p className="mt-0.5 truncate text-[10px] text-slate-600">{evidence.detail}</p></div>{evidence.verified ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" /> : <Clock3 className="h-4 w-4 shrink-0 text-amber-400" />}</a>;
}

export function PaymentSummary({ amount, status = "Escrowed", compact = false }: { amount: number; status?: string; compact?: boolean }) {
  return <div className={cn("rounded-xl border border-emerald-400/15 bg-emerald-400/[0.045]", compact ? "p-3" : "p-4")}><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300/70">Payment {status}</p><p className="mt-2 font-mono text-[22px] tracking-[-0.03em] text-white">{amount.toLocaleString()} <span className="text-[12px] text-emerald-300/70">USDC</span></p></div><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300"><CircleDollarSign className="h-4 w-4" /></div></div><p className="mt-2 text-[11px] leading-relaxed text-slate-500">Released automatically when evidence and human review both pass.</p></div>;
}

export function ProofReceiptCard({ proof }: { proof: ProofReceipt }) {
  return <Link to={`/proofs/${proof.id}`} className="panel group block overflow-hidden transition hover:-translate-y-0.5 hover:border-emerald-400/20 hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-violet-400/60"><div className="border-b border-white/[0.06] bg-[linear-gradient(135deg,rgba(52,211,153,0.06),transparent_45%)] p-5"><div className="flex items-start justify-between gap-4"><div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"><BadgeCheck className="h-5 w-5" /></div><StatusBadge status={proof.status} /></div><p className="mt-5 line-clamp-2 text-[14px] font-medium leading-relaxed text-slate-100 group-hover:text-white">{proof.taskTitle}</p><p className="mt-1 font-mono text-[10px] text-slate-600">{proof.id}</p></div><div className="space-y-3 p-5"><div className="flex items-center justify-between text-[11px]"><span className="text-slate-600">Contributor</span><span className="text-slate-300">{proof.contributorName}</span></div><div className="flex items-center justify-between text-[11px]"><span className="text-slate-600">Verified criteria</span><span className="font-mono text-emerald-300">{proof.criteriaPassed}/{proof.criteriaTotal}</span></div><div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px]"><span className="text-slate-600">Reward</span><span className="font-mono font-medium text-white">{proof.reward.toLocaleString()} USDC</span></div></div></Link>;
}

export function ActivityTimeline({ events = activity, limit }: { events?: ActivityEvent[]; limit?: number }) {
  const shown = limit ? events.slice(0, limit) : events;
  return <div className="space-y-0">{shown.map((event, index) => <Link to={event.href ?? "#"} key={event.id} onClick={(e) => { if (!event.href) { e.preventDefault(); toast.info("Activity details are mocked"); } }} className="group flex gap-3 py-3 first:pt-0 last:pb-0"><div className="flex flex-col items-center"><div className={cn("mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border", event.color === "emerald" && "border-emerald-400/20 bg-emerald-400/10 text-emerald-300", event.color === "violet" && "border-violet-400/20 bg-violet-400/10 text-violet-300", event.color === "amber" && "border-amber-400/20 bg-amber-400/10 text-amber-300", event.color === "blue" && "border-sky-400/20 bg-sky-400/10 text-sky-300", event.color === "red" && "border-red-400/20 bg-red-400/10 text-red-300")}>{event.kind === "verified" ? <CheckCircle2 className="h-3.5 w-3.5" /> : event.kind === "issued" ? <BadgeCheck className="h-3.5 w-3.5" /> : event.kind === "funded" ? <CircleDollarSign className="h-3.5 w-3.5" /> : event.kind === "revoked" ? <X className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}</div>{index < shown.length - 1 && <div className="my-1 h-full w-px bg-white/[0.07]" />}</div><div className="min-w-0 flex-1 border-b border-white/[0.06] pb-3 group-last:border-0"><div className="flex items-start justify-between gap-3"><p className="text-[12px] font-medium text-slate-300 group-hover:text-white">{event.title}</p><span className="shrink-0 text-[10px] text-slate-600">{event.timestamp}</span></div><p className="mt-1 truncate text-[11px] text-slate-600">{event.detail}</p></div></Link>)}</div>;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: { icon?: typeof Inbox; title: string; description: string; action?: ReactNode }) {
  return <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.1] bg-white/[0.015] px-6 text-center"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-500"><Icon className="h-5 w-5" /></div><h3 className="text-[13px] font-medium text-slate-300">{title}</h3><p className="mt-1 max-w-sm text-[12px] leading-relaxed text-slate-600">{description}</p>{action && <div className="mt-4">{action}</div>}</div>;
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-red-400/15 bg-red-400/[0.025] px-6 text-center"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10 text-red-300"><ShieldCheck className="h-5 w-5" /></div><h3 className="text-[13px] font-medium text-slate-300">We couldn’t load this view</h3><p className="mt-1 text-[12px] text-slate-600">The mock service returned an error. Try again.</p>{onRetry && <Button variant="secondary" className="mt-4" onClick={onRetry}>Retry</Button>}</div>;
}

export function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", onConfirm, onClose }: { open: boolean; title: string; description: string; confirmLabel?: string; onConfirm: () => void; onClose: () => void }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onMouseDown={onClose}><div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-2xl border border-white/[0.1] bg-[#11141b] p-5 shadow-2xl shadow-black/60" onMouseDown={(e) => e.stopPropagation()}><div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300"><CircleHelp className="h-4 w-4" /></div><h2 className="text-[15px] font-semibold text-white">{title}</h2><p className="mt-2 text-[12px] leading-relaxed text-slate-500">{description}</p><div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={onConfirm}>{confirmLabel}</Button></div></div></div>;
}

export function SectionHeading({ title, action }: { title: string; action?: ReactNode }) { return <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-[13px] font-semibold text-slate-200">{title}</h2>{action}</div>; }

export function CopyButton({ value }: { value: string }) { return <button type="button" aria-label="Copy to clipboard" onClick={() => { navigator.clipboard?.writeText(value); toast.success("Copied to clipboard"); }} className="rounded-md p-1 text-slate-600 transition hover:bg-white/[0.07] hover:text-slate-300"><Copy className="h-3.5 w-3.5" /></button>; }

export function LoadingSkeleton({ className }: { className?: string }) { return <div className={cn("animate-pulse rounded-lg bg-white/[0.06]", className)} />; }

export function SearchFilter({ value, onChange, placeholder = "Filter tasks…" }: { value: string; onChange: (value: string) => void; placeholder?: string }) { return <div className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3"><Search className="h-3.5 w-3.5 text-slate-600" /><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent text-[12px] text-slate-300 outline-none placeholder:text-slate-600" /></div>; }
