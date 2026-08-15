"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-border/80">
        <CardHeader className="text-center pb-2">
          <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground font-black text-2xl flex items-center justify-center mx-auto shadow-lg mb-2">
            B
          </div>
          <CardTitle className="text-xl font-black tracking-tight">Reset Administrator Password</CardTitle>
          <CardDescription className="text-xs">
            Enter your registered admin email to receive a password reset magic link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold space-y-2 text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto text-emerald-400" />
              <p>Password reset instructions sent to <strong>{email}</strong>!</p>
              <p className="text-[11px] text-muted-foreground font-normal">Check your inbox for security validation.</p>
              <div className="pt-3">
                <Button size="sm" variant="outline" onClick={() => router.push("/login")} className="text-xs font-bold">
                  Back to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Admin Email Address</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bookmyshow.com"
                  className="h-9 text-xs"
                />
              </div>

              <Button type="submit" className="w-full h-10 font-bold text-xs gap-1.5 shadow-md">
                Send Password Reset Link
                <ArrowRight className="h-4 w-4" />
              </Button>

              <div className="pt-2 text-center text-xs text-muted-foreground">
                Remember your password?{" "}
                <a href="/login" className="font-bold text-primary hover:underline">
                  Sign In
                </a>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
