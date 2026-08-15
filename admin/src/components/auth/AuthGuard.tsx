"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { RefreshCw, ShieldAlert } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, checkAuth, token } = useAuthStore();
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    checkAuth();
    setChecking(false);
  }, [checkAuth]);

  React.useEffect(() => {
    if (!checking) {
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null;
      if (!isAuthenticated || (!token && !storedToken)) {
        router.replace("/login");
      }
    }
  }, [checking, isAuthenticated, token, router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Verifying Administrator Session...
        </span>
      </div>
    );
  }

  const storedToken = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null;
  if (!isAuthenticated || (!token && !storedToken)) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center space-y-4">
        <ShieldAlert className="h-10 w-10 text-rose-500 animate-pulse" />
        <span className="text-sm font-bold text-foreground">Access Denied. Redirecting to sign in...</span>
      </div>
    );
  }

  return <>{children}</>;
}
