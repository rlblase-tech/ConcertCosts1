"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Music2 } from "lucide-react";
import { ThemeSelector } from "@/components/ThemeSelector";
import { signInAction, signUpAction } from "@/app/auth/actions";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result =
        mode === "signin"
          ? await signInAction(email, password)
          : await signUpAction(email, password);

      setLoading(false);

      if (!result.ok) {
        setError(result.error);
        if (result.error.toLowerCase().includes("already registered")) {
          setMode("signin");
        }
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setLoading(false);
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Check Vercel env vars and redeploy."
      );
    }
  }

  return (
    <div className="app-photo-bg min-h-screen">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-lg">
              <Music2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                Welcome
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md">
                Concert Cost Tracker
              </h1>
            </div>
          </div>
          <div className="rounded-box bg-base-100/90 p-1 backdrop-blur-sm">
            <ThemeSelector compact />
          </div>
        </div>

        <p className="mb-6 text-white/85 text-sm sm:text-base max-w-md drop-shadow">
          Log every show, track what you spent, and see which concerts gave you
          the most fun for your money.
        </p>

        <div className="card bg-base-100/95 shadow-2xl border border-base-300 backdrop-blur-md">
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
              Full concert costs stay private to your account. Community scores
              only share averages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
