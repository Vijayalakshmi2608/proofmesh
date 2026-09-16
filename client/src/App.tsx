import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AppShell } from "./components/AppShell";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import { NewTask } from "./pages/Tasks";
import Tasks from "./pages/Tasks";
import TaskDetail from "./pages/TaskDetail";
import SubmissionDetail from "./pages/SubmissionDetail";
import Proofs, { ProofDetail } from "./pages/Proofs";
import Settings from "./pages/Settings";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } });

function Workspace({ children }: { children: React.ReactNode }) { return <AppShell>{children}</AppShell>; }

export default function App() {
  return <QueryClientProvider client={queryClient}><BrowserRouter><Toaster theme="dark" position="bottom-right" toastOptions={{ className: "proof-toast" }} /><Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/dashboard" element={<Workspace><Dashboard /></Workspace>} />
    <Route path="/tasks" element={<Workspace><Tasks /></Workspace>} />
    <Route path="/tasks/new" element={<Workspace><NewTask /></Workspace>} />
    <Route path="/tasks/:id" element={<Workspace><TaskDetail /></Workspace>} />
    <Route path="/submissions/:id" element={<Workspace><SubmissionDetail /></Workspace>} />
    <Route path="/proofs" element={<Workspace><Proofs /></Workspace>} />
    <Route path="/proofs/:id" element={<Workspace><ProofDetail /></Workspace>} />
    <Route path="/settings" element={<Workspace><Settings /></Workspace>} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></BrowserRouter></QueryClientProvider>;
}
