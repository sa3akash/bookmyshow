"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, checkAuth, token } = useAuthStore();

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  React.useEffect(() => {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null;
    if (!isAuthenticated && !storedToken) {
      router.replace("/login");
    }
  }, [isAuthenticated, token, router]);

  return <>{children}</>;
}
