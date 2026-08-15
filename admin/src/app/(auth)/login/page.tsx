"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth.store";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = React.useState("admin@bookmyshow.com");
  const [password, setPassword] = React.useState("••••••••••••");
  const [mfaCode, setMfaCode] = React.useState("");
  const [step, setStep] = React.useState<"CREDENTIALS" | "MFA">("CREDENTIALS");
  const [loading, setLoading] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "CREDENTIALS") {
      setStep("MFA");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      login({
        name: "Shakil Ahmed",
        email,
        role: "SUPER_ADMIN",
      });
      router.push("/dashboard");
    }, 600);
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
            {step === "CREDENTIALS" ? "Sign in with elevated administrator credentials" : "Enter 6-digit Authenticator MFA code"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {step === "CREDENTIALS" ? (
              <>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Admin Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Password</label>
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

            <Button type="submit" disabled={loading} className="w-full h-10 font-bold text-xs gap-1.5">
              {loading ? "Authenticating..." : step === "CREDENTIALS" ? "Continue to MFA" : "Verify & Sign In"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
