"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Phone, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";

export default function RegisterAdminPage() {
  const router = useRouter();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [successMsg, setSuccessMsg] = React.useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      await apiClient.post("/auth/register", {
        email,
        phone: phone || undefined,
        password,
        fullName,
      });

      setSuccessMsg("Administrator account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || "Registration failed. User with this email may already exist.");
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
          <CardTitle className="text-xl font-black tracking-tight">Register Administrator</CardTitle>
          <CardDescription className="text-xs">
            Create an administrator or venue manager account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Full Name</label>
              <Input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Shakil Ahmed"
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Email Address</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bookmyshow.com"
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Phone Number (Optional)</label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1700 000000"
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Password</label>
              <Input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="h-9 text-xs"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-10 font-bold text-xs gap-1.5 shadow-md mt-2">
              {loading ? "Creating Account..." : "Create Account"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-4 pt-3 border-t border-border/60 text-center text-xs text-muted-foreground">
            Already have an admin account?{" "}
            <a href="/login" className="font-bold text-primary hover:underline">
              Sign In
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
