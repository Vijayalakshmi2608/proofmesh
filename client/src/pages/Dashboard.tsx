import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, Blocks, CircleDollarSign, Clock3, FileCheck2, Plus, ScanLine, UsersRound } from "lucide-react";
import { ActivityTimeline, Button, MetricCard, PageHeader, SectionHeading, StatusBadge, TaskCard } from "../components/AppShell";
import { activity, tasks } from "../lib/mockData";

const metrics = [
  { label: "Active tasks", value: "2", detail: <span><span className="text-emerald-300">+1</span> this week</span>, icon: Blocks, accent: "violet" as const },
  { label: "Pending reviews", value: "1", detail: <span>Oldest is <span className="text-amber-300">18m</span> old</span>, icon: FileCheck2, accent: "amber" as const },
  { label: "Total escrowed", value: "$4,200", detail: <span>Across <span className="text-slate-300">2 active tasks</span></span>, icon: CircleDollarSign, accent: "emerald" as const },
  { label: "Verified work", value: "18", detail: <span><span className="text-emerald-300">+4</span> receipts this month</span>, icon: BadgeCheck, accent: "blue" as const },
];

export default function Dashboard() {
  const { data: dashboardTasks = tasks } = useQuery({ queryKey: ["dashboard-tasks"], queryFn: async () => tasks });
  return <div>
    <PageHeader eyebrow="Sponsor workspace" title="Good morning, Alex" description="A focused view of work moving through ProofMesh." actions={<Button onClick={() => {}}><Plus className="h-3.5 w-3.5" /> Create task</Button>} />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</div>
    <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.8fr)]">
      <section>
        <SectionHeading title="Work in motion" action={<Link to="/tasks" className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-300 hover:text-violet-200">View all <ArrowRight className="h-3 w-3" /></Link>} />
        <div className="grid gap-3 md:grid-cols-2">{dashboardTasks.slice(0, 2).map((task) => <TaskCard key={task.id} task={task} />)}</div>
      </section>
      <section className="panel p-5">
        <SectionHeading title="Recent activity" action={<Link to="/proofs" className="text-[11px] text-slate-600 hover:text-slate-300">View log</Link>} />
        <ActivityTimeline events={activity} limit={5} />
      </section>
    </div>
    <div className="mt-6 grid gap-3 md:grid-cols-3">
      <Link to="/tasks/new" className="group rounded-xl border border-violet-400/20 bg-[linear-gradient(135deg,rgba(128,119,255,0.12),rgba(128,119,255,0.035))] p-4 transition hover:border-violet-400/35"><div className="mb-8 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-400/15 text-violet-300"><Plus className="h-4 w-4" /></div><p className="text-[13px] font-medium text-slate-200">Create a task</p><p className="mt-1 text-[11px] text-slate-500">Define the outcome before work starts.</p><ArrowRight className="mt-4 h-4 w-4 text-violet-300 transition group-hover:translate-x-1" /></Link>
      <Link to="/submissions/sub-001" className="group rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 transition hover:border-white/[0.15] hover:bg-white/[0.04]"><div className="mb-8 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300"><ScanLine className="h-4 w-4" /></div><p className="text-[13px] font-medium text-slate-200">Review evidence</p><p className="mt-1 text-[11px] text-slate-500">One submission is waiting for your sign-off.</p><ArrowRight className="mt-4 h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-slate-300" /></Link>
      <button type="button" onClick={() => {}} className="group rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-left transition hover:border-white/[0.15] hover:bg-white/[0.04]"><div className="mb-8 flex h-8 w-8 items-center justify-center rounded-lg bg-sky-400/10 text-sky-300"><UsersRound className="h-4 w-4" /></div><p className="text-[13px] font-medium text-slate-200">Invite a reviewer</p><p className="mt-1 text-[11px] text-slate-500">Add a second set of eyes to high-stakes work.</p><ArrowRight className="mt-4 h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-slate-300" /></button>
    </div>
    <div className="mt-7 flex items-center gap-2 text-[11px] text-slate-600"><Clock3 className="h-3.5 w-3.5" /> Median submission-to-payout <span className="font-mono text-slate-400">6h 24m</span><span className="text-emerald-300">↓ 18% vs last month</span></div>
  </div>;
}
