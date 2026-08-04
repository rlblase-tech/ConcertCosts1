"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Music2 } from "lucide-react";
import { ThemeSelector } from "@/components/ThemeSelector";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (signInError) {
        const msg = signInError.message.toLowerCase();
        if (msg.includes("confirm") || msg.includes("not confirmed")) {
          setError(
            "This account still needs email confirmation. In Supabase go to Authentication → Providers → Email, turn OFF “Confirm email”, save, then try again — or create a brand-new email address."
          );
        } else if (msg.includes("invalid")) {
          setError(
            "Wrong email or password. Try again, or create an account."
          );
        } else {
          setError(signInError.message);
        }
        return;
      }
      router.push("/");
      router.refresh();
      return;
    }

    const emailTrimmed = email.trim();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: emailTrimmed,
      password,
    });

    if (signUpError) {
      // Account may already exist — try signing in with the same password
      const { error: signInAfterFail } = await supabase.auth.signInWithPassword({
        email: emailTrimmed,
        password,
      });
      setLoading(false);
      if (signInAfterFail) {
        setError(
          signUpError.message.includes("already") ||
            signUpError.message.includes("registered")
            ? "That email is already registered. Try Sign in with your password."
            : signUpError.message
        );
        setMode("signin");
        return;
      }
      router.push("/");
      router.refresh();
      return;
    }

    // Prefer an immediate session (works when email confirmation is off)
    if (data.session) {
      setLoading(false);
      router.push("/");
      router.refresh();
      return;
    }

    // No session after signup — still try signing in so you land in the app
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: emailTrimmed,
      password,
    });
    setLoading(false);

    if (!signInError) {
      router.push("/");
      router.refresh();
      return;
    }

    setMode("signin");
    setError(
      "Your account was created, but you still need to sign in. " +
        "If it fails, open Supabase → Authentication → Providers → Email and turn OFF “Confirm email”, then try Sign in."
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-base-200 to-secondary/25" />
      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-lg">
              <Music2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/60">
                Welcome
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Concert Cost Tracker
              </h1>
            </div>
          </div>
          <ThemeSelector compact />
        </div>

        <p className="mb-6 text-base-content/70 text-sm sm:text-base max-w-md">
          Log every show, track what you spent, and see which concerts gave you
          the most fun for your money.
        </p>

        <div className="card bg-base-100/95 shadow-2xl border border-base-300 backdrop-blur">
          <div className="card-body gap-5">
            <div className="tabs tabs-boxed bg-base-200 p-1">
              <button
                type="button"
                className={`tab flex-1 ${mode === "signin" ? "tab-active !bg-primary !text-primary-content" : ""}`}
                onClick={() => {
                  setMode("signin");
                  setError(null);
                }}
              >
                Sign in
              </button>
              <button
                type="button"
                className={`tab flex-1 ${mode === "signup" ? "tab-active !bg-primary !text-primary-content" : ""}`}
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
              >
                Create account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-[5.5rem_1fr] items-center gap-x-3 gap-y-4">
                <label htmlFor="email" className="text-sm font-medium text-right">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />

                <label
                  htmlFor="password"
                  className="text-sm font-medium text-right"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  className="input input-bordered w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                />
              </div>

              {error && (
                <div role="alert" className="alert alert-error text-sm">
                  <span>{error}</span>
                </div>
              )}
              {message && (
                <div role="alert" className="alert alert-info text-sm">
                  <span>{message}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner" />
                ) : mode === "signin" ? (
                  "Sign in"
                ) : (
                  "Create my account"
                )}
              </button>
            </form>

            <p className="text-center text-xs text-base-content/50">
              Your concerts stay private to your account only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
