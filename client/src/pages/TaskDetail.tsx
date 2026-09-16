import { Link, useParams } from "react-router-dom";
import { ArrowUpRight, CircleDollarSign, Clock3, FileCheck2, Github, MoreHorizontal, ShieldCheck, UsersRound } from "lucide-react";
import { Button, ConfirmDialog, PageHeader, PaymentSummary, SectionHeading, StatusBadge, TaskStatusTimeline, VerificationChecklist } from "../components/AppShell";
import { useState } from "react";
import { toast } from "sonner";
import { useSubmission, useTask } from "../hooks/useProofMeshApi";

export default function TaskDetail() {
  const { id = "task-001" } = useParams();
  const { data: taskQuery } = useTask(id);
  const { data: submissionQuery } = useSubmission("sub-001");
  const task = taskQuery?.item;
  const submission = submissionQuery?.item;
  if (!task || !submission) return null;
  const [confirmOpen, setConfirmOpen] = useState(false);
  return <div>
    <PageHeader eyebrow={`${task.project} · ${task.id}`} title={task.title} description={task.summary} backHref="/tasks" actions={<><StatusBadge status={task.status} /><button type="button" onClick={() => toast.info("Task actions are mocked")} aria-label="More task actions" className="rounded-lg border border-white/[0.08] p-2 text-slate-500 hover:bg-white/[0.06] hover:text-slate-200"><MoreHorizontal className="h-4 w-4" /></button></>} />
    <div className="mb-7 flex flex-wrap items-center gap-2 text-[11px] text-slate-600"><span className="flex items-center gap-1.5"><UsersRound className="h-3.5 w-3.5" /> Sponsor: <span className="text-slate-400">{task.sponsorName}</span></span><span className="text-slate-700">/</span><span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> Due {task.dueDate}</span><span className="text-slate-700">/</span><span className="flex items-center gap-1.5"><Github className="h-3.5 w-3.5" /> {task.tags.join(" · ")}</span></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
      <div className="space-y-6">
        <section className="panel p-5 sm:p-6"><SectionHeading title="Acceptance criteria" action={<span className="font-mono text-[10px] text-slate-600">{task.acceptance.filter((item) => item.passed).length}/{task.acceptance.length} passed</span>} /><VerificationChecklist task={task} /></section>
        <section className="panel p-5 sm:p-6"><SectionHeading title="Latest submission" action={submission && <Link to={`/submissions/${submission.id}`} className="inline-flex items-center gap-1 text-[11px] text-violet-300 hover:text-violet-200">Open evidence <ArrowUpRight className="h-3 w-3" /></Link>} />{task.submissions ? <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[13px] font-medium text-slate-200">{submission.contributorName}</p><p className="mt-1 text-[11px] text-slate-600">Submitted {submission.submittedAt}</p></div><StatusBadge status={submission.status} /></div><p className="mt-4 text-[12px] leading-relaxed text-slate-500">{submission.note}</p><div className="mt-4 flex flex-wrap gap-2"><span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-300"><ShieldCheck className="h-3 w-3" /> Automated checks passed</span><span className="inline-flex items-center gap-1.5 rounded-md bg-amber-400/10 px-2 py-1 text-[10px] text-amber-300"><Clock3 className="h-3 w-3" /> Human review pending</span></div></div> : <div className="py-8 text-center text-[12px] text-slate-600">No evidence submitted yet.</div>}</section>
      </div>
      <aside className="space-y-6"><PaymentSummary amount={task.reward} status={task.status === "verified" ? "Settled" : "Escrowed"} /><section className="panel p-5"><SectionHeading title="Settlement timeline" /><TaskStatusTimeline task={task} /></section><section className="panel p-5"><SectionHeading title="Task metadata" /><div className="space-y-3 text-[11px]"><div className="flex justify-between"><span className="text-slate-600">Network</span><span className="flex items-center gap-1.5 text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-violet-400" />Solana</span></div><div className="flex justify-between"><span className="text-slate-600">Submissions</span><span className="font-mono text-slate-300">{task.submissions} / {task.maxSubmissions}</span></div><div className="flex justify-between"><span className="text-slate-600">Escrow account</span><button type="button" onClick={() => toast.success("Escrow address copied")} className="font-mono text-violet-300 hover:text-violet-200">6Lk2…A9qE</button></div></div></section>{task.status === "in_review" && <Button className="w-full" onClick={() => setConfirmOpen(true)}><FileCheck2 className="h-3.5 w-3.5" /> Review submission</Button>}</aside>
    </div>
    <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={() => { setConfirmOpen(false); toast.success("Review workspace opened"); }} title="Open review workspace?" description="You’ll be able to compare the evidence against each acceptance criterion. No settlement action happens in this demo." confirmLabel="Open review" />
  </div>;
}
