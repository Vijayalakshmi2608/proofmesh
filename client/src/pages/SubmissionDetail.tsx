import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, Clock3, FileCheck2, Flag, GitCommitHorizontal, MessageSquare, ScanLine, ShieldCheck, UserRoundCheck } from "lucide-react";
import { toast } from "sonner";
import { Button, ConfirmDialog, EvidenceCard, PageHeader, PaymentSummary, SectionHeading, StatusBadge } from "../components/AppShell";
import { getTask } from "../lib/mockData";
import { useSubmission } from "../hooks/useProofMeshApi";

export default function SubmissionDetail() {
  const { id = "sub-001" } = useParams();
  const { data: submissionQuery } = useSubmission(id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const submission = submissionQuery?.item;
  if (!submission) return null;
  const task = getTask(submission.taskId);
  return <div>
    <PageHeader eyebrow={`Submission · ${submission.id}`} title="Review evidence" description={`Verify the work submitted for ${submission.taskTitle}.`} backHref={`/tasks/${task.id}`} actions={<StatusBadge status={submission.status} />} />
    <div className="mb-7 flex flex-wrap items-center gap-3 text-[11px] text-slate-600"><span className="flex items-center gap-1.5"><UserRoundCheck className="h-3.5 w-3.5" /> Submitted by <span className="text-slate-300">{submission.contributorName}</span></span><span className="text-slate-700">/</span><span>{submission.submittedAt}</span><span className="text-slate-700">/</span><span className="font-mono text-slate-500">{submission.contributor}</span></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
      <div className="space-y-6">
        <section className="panel p-5 sm:p-6"><SectionHeading title="Contributor note" action={<span className="font-mono text-[10px] text-slate-600">{submission.duration} elapsed</span>} /><p className="text-[13px] leading-7 text-slate-400">{submission.note}</p><div className="mt-5 flex flex-wrap gap-2"><span className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[10px] text-slate-500"><GitCommitHorizontal className="h-3 w-3" /> 9 commits</span><span className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[10px] text-slate-500"><ScanLine className="h-3 w-3" /> 3 automated artifacts</span><span className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[10px] text-slate-500"><MessageSquare className="h-3 w-3" /> 2 comments</span></div></section>
        <section className="panel p-5 sm:p-6"><SectionHeading title="Evidence bundle" action={<span className="font-mono text-[10px] text-slate-600">{submission.evidence.length} artifacts</span>} /><div className="grid gap-2 sm:grid-cols-2">{submission.evidence.map((evidence) => <EvidenceCard key={evidence.id} evidence={evidence} />)}</div></section>
        <section className="panel p-5 sm:p-6"><SectionHeading title="Reviewer notes" /><textarea rows={4} placeholder="Leave a note for the contributor or your team…" className="w-full rounded-lg border border-white/[0.09] bg-white/[0.025] p-3 text-[12px] leading-relaxed text-white outline-none placeholder:text-slate-700 focus:border-violet-400/50" /><div className="mt-3 flex justify-end"><Button variant="secondary" onClick={() => toast.success("Note saved")}>Save note</Button></div></section>
      </div>
      <aside className="space-y-6"><section className="panel p-5"><SectionHeading title="Verification checks" /><div className="space-y-1">{submission.checks.map((check) => <div key={check.label} className="flex items-start gap-3 border-b border-white/[0.06] py-3 first:pt-0 last:border-0 last:pb-0"><div className={check.state === "passed" ? "text-emerald-300" : check.state === "pending" ? "text-amber-300" : "text-red-300"}>{check.state === "passed" ? <CheckCircle2 className="h-4 w-4" /> : check.state === "pending" ? <Clock3 className="h-4 w-4" /> : <Flag className="h-4 w-4" />}</div><div className="min-w-0"><p className="text-[12px] font-medium text-slate-300">{check.label}</p><p className="mt-1 text-[11px] text-slate-600">{check.value}</p></div></div>)}</div></section><PaymentSummary amount={task.reward} status={submission.status === "verified" ? "Settled" : "Escrowed"} /><div className="rounded-xl border border-violet-400/15 bg-violet-400/[0.035] p-4"><div className="flex items-center gap-2 text-[11px] font-medium text-violet-200"><ShieldCheck className="h-3.5 w-3.5" /> What happens next?</div><p className="mt-2 text-[11px] leading-relaxed text-slate-500">Approve when the evidence satisfies every criterion. ProofMesh will release escrow and issue a portable receipt.</p><Link to={`/tasks/${task.id}`} className="mt-3 inline-flex items-center gap-1 text-[11px] text-violet-300 hover:text-violet-200">View task criteria <ArrowUpRight className="h-3 w-3" /></Link></div>{submission.status === "pending" && <div className="flex gap-2"><Button className="flex-1" onClick={() => setConfirmOpen(true)}><CheckCircle2 className="h-3.5 w-3.5" /> Approve</Button><Button variant="danger" onClick={() => toast.info("Request-changes flow is mocked")} aria-label="Request changes"><Flag className="h-3.5 w-3.5" /></Button></div>}</aside>
    </div>
    <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={() => { setConfirmOpen(false); toast.success("Submission verified — escrow release queued"); }} title="Approve this submission?" description={`This will mark ${submission.contributorName}'s work as verified and queue ${task.reward.toLocaleString()} USDC for settlement.`} confirmLabel="Approve & settle" />
  </div>;
}
