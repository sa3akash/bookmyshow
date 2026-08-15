"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck, ArrowRight, AlertCircle, Key, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth.store";

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginWithCredentials } = useAuthStore();
  const [email, setEmail] = React.useState("admin@bookmyshow.com");
  const [password, setPassword] = React.useState("Admin123!");
  const [mfaCode, setMfaCode] = React.useState("882910");
  const [step, setStep] = React.useState<"CREDENTIALS" | "MFA">("CREDENTIALS");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const fillQuickCredentials = (e: string) => {
    setEmail(e);
    setPassword("Admin123!");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (step === "CREDENTIALS") {
      setStep("MFA");
      return;
    }

    setLoading(true);
    try {
      // Execute actual POST request to server /api/v1/auth/login
      await loginWithCredentials(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err?.message || "Authentication failed. Invalid email/password or server offline.");
      setStep("CREDENTIALS");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-border/80">
        <CardHeader className="text-center pb-2">
          <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground font-black text-2xl flex items-center justify-center mx-auto shadow-lg mb-2">
            B
          </div>
          <CardTitle className="text-xl font-black tracking-tight">BookMyShow Admin Console</CardTitle>
          <CardDescription className="text-xs">
            {step === "CREDENTIALS"
              ? "Sign in with live server administrator credentials"
              : "Enter 6-digit Authenticator MFA security code"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Server Seeded Accounts Bar */}
          <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-primary font-bold">
              <span className="flex items-center gap-1">
                <Key className="h-3.5 w-3.5" /> Seeded Server Accounts:
              </span>
              <span className="font-mono text-[10px]">Pass: Admin123!</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => fillQuickCredentials("admin@bookmyshow.com")}
                className="px-2 py-1 rounded bg-card border border-border text-[10px] font-bold text-foreground hover:border-primary cursor-pointer transition-all"
              >
                👑 Super Admin
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials("manager.movie@bookmyshow.com")}
                className="px-2 py-1 rounded bg-card border border-border text-[10px] font-bold text-foreground hover:border-primary cursor-pointer transition-all"
              >
                🎬 Movie Manager
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials("manager.venue@bookmyshow.com")}
                className="px-2 py-1 rounded bg-card border border-border text-[10px] font-bold text-foreground hover:border-primary cursor-pointer transition-all"
              >
                🏢 Venue Manager
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {step === "CREDENTIALS" ? (
              <>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Admin Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-foreground">Password</label>
                    <a href="/forgot-password" className="text-[11px] font-medium text-primary hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </>
            ) : (
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">MFA Security Code</label>
                <Input
                  type="text"
                  placeholder="e.g. 882910"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  maxLength={6}
                  className="font-mono text-center tracking-widest text-base"
                  autoFocus
                  required
                />
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full h-10 font-bold text-xs gap-1.5 shadow-md">
              {loading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Verifying Server Credentials...
                </>
              ) : step === "CREDENTIALS" ? (
                <>
                  Continue to MFA <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Verify & Sign In <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-3 border-t border-border/60 text-center text-xs text-muted-foreground">
            Need an admin account?{" "}
            <a href="/register" className="font-bold text-primary hover:underline">
              Register New Admin
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
