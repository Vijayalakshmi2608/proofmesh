import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const demoRoles = ["sponsor", "contributor", "reviewer", "public_verifier"] as const;
export type DemoRole = (typeof demoRoles)[number];
export interface DemoUser { id: string; displayName: string; role: DemoRole; walletAddress: string; }

const users: Record<DemoRole, DemoUser> = {
  sponsor: { id: "demo-sponsor", displayName: "Alex Rivera", role: "sponsor", walletAddress: "7pT9…K3xL" },
  contributor: { id: "demo-contributor", displayName: "Maya Chen", role: "contributor", walletAddress: "7pT9…K3xL" },
  reviewer: { id: "demo-reviewer", displayName: "Avery Rivera", role: "reviewer", walletAddress: "6aQ1…mR04" },
  public_verifier: { id: "demo-public-verifier", displayName: "Public verifier", role: "public_verifier", walletAddress: "" },
};

const DemoUserContext = createContext<{ user: DemoUser; role: DemoRole; setRole: (role: DemoRole) => void; users: typeof users } | null>(null);

export function DemoUserProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<DemoRole>(() => {
    if (typeof window === "undefined") return "sponsor";
    const saved = window.localStorage.getItem("proofmesh-demo-role") as DemoRole | null;
    return saved && demoRoles.includes(saved) ? saved : "sponsor";
  });
  const setRole = (nextRole: DemoRole) => { setRoleState(nextRole); window.localStorage.setItem("proofmesh-demo-role", nextRole); };
  const value = useMemo(() => ({ user: users[role], role, setRole, users }), [role]);
  useEffect(() => { document.documentElement.dataset.demoRole = role; }, [role]);
  return <DemoUserContext.Provider value={value}>{children}</DemoUserContext.Provider>;
}

export function useCurrentDemoUser() { const context = useContext(DemoUserContext); if (!context) throw new Error("useCurrentDemoUser must be used within DemoUserProvider"); return context; }
