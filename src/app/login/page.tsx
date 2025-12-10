"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please check your connection and try again.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute inset-y-10 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-br from-indigo-500/20 via-sky-400/15 to-purple-500/25 blur-2xl" />
        <Card className="relative border border-white/10 bg-slate-900/70 shadow-2xl shadow-indigo-900/40 backdrop-blur">
          <CardHeader className="space-y-2 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
              Sign in
            </p>
            <CardTitle className="text-2xl font-bold text-slate-50">
              Admin login
            </CardTitle>
            <CardDescription className="text-slate-200/80">
              Use your work email and password to access the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert
                variant="destructive"
                className="border-red-500/50 bg-red-500/10 text-red-100"
              >
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-100">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 border-white/10 bg-white/5 text-slate-50 placeholder:text-slate-400 focus-visible:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-100">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 border-white/10 bg-white/5 text-slate-50 placeholder:text-slate-400 focus-visible:ring-indigo-500"
                />
              </div>
              <Button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-purple-500 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:via-sky-400 hover:to-purple-400"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in to dashboard"}
              </Button>
              <p className="text-center text-xs text-slate-300/70">
                Protected access for Evergreen Systems team members.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
