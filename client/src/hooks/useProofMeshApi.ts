import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentDemoUser } from "../contexts/DemoUserContext";
import { activity as localActivity, getProof as getLocalProof, getSubmission as getLocalSubmission, getTask as getLocalTask, proofs as localProofs, submissions as localSubmissions, tasks as localTasks } from "../lib/mockData";
import type { ActivityEvent, ProofReceipt, Submission, Task } from "../lib/types";

export interface ApiEnvelope<T> { data: T; }
export async function apiRequest<T>(path: string, role: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, headers: { "Content-Type": "application/json", "x-demo-role": role, ...(init?.headers ?? {}) } });
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  const envelope = await response.json() as ApiEnvelope<T>;
  return envelope.data;
}
export function useTasks() { const { role } = useCurrentDemoUser(); return useQuery({ queryKey: ["api-tasks", role], queryFn: async () => { try { return { items: await apiRequest<Task[]>("/api/tasks", role), fallback: false }; } catch { return { items: localTasks, fallback: true }; } } }); }
export function useTask(id: string) { const { role } = useCurrentDemoUser(); return useQuery({ queryKey: ["api-task", id, role], queryFn: async () => { try { return { item: await apiRequest<Task>(`/api/tasks/${id}`, role), fallback: false }; } catch { return { item: getLocalTask(id), fallback: true }; } } }); }
export function useSubmissions() { const { role } = useCurrentDemoUser(); return useQuery({ queryKey: ["api-submissions", role], queryFn: async () => { try { return { items: await apiRequest<Submission[]>("/api/submissions", role), fallback: false }; } catch { return { items: localSubmissions, fallback: true }; } } }); }
export function useSubmission(id: string) { const { role } = useCurrentDemoUser(); return useQuery({ queryKey: ["api-submission", id, role], queryFn: async () => { try { return { item: await apiRequest<Submission>(`/api/submissions/${id}`, role), fallback: false }; } catch { return { item: getLocalSubmission(id), fallback: true }; } } }); }
export function useProofs() { const { role } = useCurrentDemoUser(); return useQuery({ queryKey: ["api-proofs", role], queryFn: async () => { try { return { items: await apiRequest<ProofReceipt[]>("/api/proofs", role), fallback: false }; } catch { return { items: localProofs, fallback: true }; } } }); }
export function useProof(id: string) { const { role } = useCurrentDemoUser(); return useQuery({ queryKey: ["api-proof", id, role], queryFn: async () => { try { return { item: await apiRequest<ProofReceipt>(`/api/proofs/${id}`, role), fallback: false }; } catch { return { item: getLocalProof(id), fallback: true }; } } }); }
export function useActivity() { const { role } = useCurrentDemoUser(); return useQuery({ queryKey: ["api-activity", role], queryFn: async () => { try { return { items: await apiRequest<ActivityEvent[]>("/api/activity", role), fallback: false }; } catch { return { items: localActivity, fallback: true }; } } }); }
export function useDashboardMetrics() { const { role } = useCurrentDemoUser(); return useQuery({ queryKey: ["api-dashboard-metrics", role], queryFn: async () => { try { return { item: await apiRequest<{ activeTasks: number; pendingReviews: number; totalEscrowed: number; verifiedWork: number; medianSubmissionToPayout: string }>("/api/dashboard/metrics", role), fallback: false }; } catch { return { item: { activeTasks: 2, pendingReviews: 1, totalEscrowed: 4200, verifiedWork: 18, medianSubmissionToPayout: "6h 24m" }, fallback: true }; } } }); }
export function useCreateTask() { const { role } = useCurrentDemoUser(); const queryClient = useQueryClient(); return useMutation({ mutationFn: (input: unknown) => apiRequest<Task>("/api/tasks", role, { method: "POST", body: JSON.stringify(input) }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["api-tasks"] }) }); }
