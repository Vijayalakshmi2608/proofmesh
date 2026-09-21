import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export const appModes = ["demo", "devnet"] as const;
export type AppMode = (typeof appModes)[number];

const AppModeContext = createContext<{ mode: AppMode; setMode: (mode: AppMode) => void } | null>(null);

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(() => {
    if (typeof window === "undefined") return "demo";
    const saved = window.localStorage.getItem("proofmesh-app-mode") as AppMode | null;
    return saved && appModes.includes(saved) ? saved : "demo";
  });
  const setMode = (nextMode: AppMode) => { setModeState(nextMode); window.localStorage.setItem("proofmesh-app-mode", nextMode); };
  const value = useMemo(() => ({ mode, setMode }), [mode]);
  return <AppModeContext.Provider value={value}>{children}</AppModeContext.Provider>;
}

export function useAppMode() { const context = useContext(AppModeContext); if (!context) throw new Error("useAppMode must be used within AppModeProvider"); return context; }

export function demoTransactionId(taskId: string, action: "fund" | "payout") { return `demo-tx-${taskId}-${action}`; }
