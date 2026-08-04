"use server";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv, probeSupabase, requireSupabaseEnv } from "@/lib/env";

export type AuthResult = { ok: true } | { ok: false; error: string };

function friendlyAuthError(message: string, extra?: string): string {
  const msg = message.toLowerCase();
  if (
    msg.includes("fetch") ||
    msg.includes("network") ||
    msg.includes("econnrefused") ||
    msg.includes("enotfound")
  ) {
    return (
      "Could not reach Supabase from the server. " +
      (extra ? `(${extra}) ` : "") +
      "Open /api/health on your site to diagnose. Re-check env var values (no quotes/spaces) and Redeploy."
    );
  }
  if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
    return "Wrong email or password. Try again, or create an account.";
  }
  if (msg.includes("confirm") || msg.includes("not confirmed")) {
    return "Email confirmation is required. In Supabase: Authentication → Providers → Email → turn Confirm email OFF.";
  }
  if (msg.includes("already") || msg.includes("registered")) {
    return "That email is already registered. Try Sign in instead.";
  }
  return message;
}

/**
 * Authenticate with raw Auth API (clear errors), then store session in cookies.
 */
async function passwordGrant(
  email: string,
  password: string
): Promise<AuthResult> {
  let env;
  try {
    env = requireSupabaseEnv();
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Missing Supabase env vars.",
    };
  }

  const probe = await probeSupabase();
  if (!probe.ok) {
    return { ok: false, error: probe.detail };
  }

  try {
    const res = await fetch(`${env.url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.key,
        Authorization: `Bearer ${env.key}`,
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const body = (await res.json().catch(() => ({}))) as {
      access_token?: string;
      refresh_token?: string;
      error?: string;
      error_description?: string;
      msg?: string;
      message?: string;
    };

    if (!res.ok) {
      const raw =
        body.error_description ||
        body.msg ||
        body.message ||
        body.error ||
        `HTTP ${res.status}`;
      return { ok: false, error: friendlyAuthError(raw) };
    }

    if (!body.access_token || !body.refresh_token) {
      return {
        ok: false,
        error: "Login response was incomplete. Try again.",
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.setSession({
      access_token: body.access_token,
      refresh_token: body.refresh_token,
    });
    if (error) {
      return { ok: false, error: friendlyAuthError(error.message) };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign in failed.";
    const cause =
      err instanceof Error && err.cause instanceof Error
        ? err.cause.message
        : undefined;
    return { ok: false, error: friendlyAuthError(message, cause) };
  }
}

async function signUpGrant(
  email: string,
  password: string
): Promise<AuthResult> {
  let env;
  try {
    env = requireSupabaseEnv();
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Missing Supabase env vars.",
    };
  }

  const probe = await probeSupabase();
  if (!probe.ok) {
    return { ok: false, error: probe.detail };
  }

  try {
    const res = await fetch(`${env.url}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.key,
        Authorization: `Bearer ${env.key}`,
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const body = (await res.json().catch(() => ({}))) as {
      access_token?: string;
      refresh_token?: string;
      error?: string;
      error_description?: string;
      msg?: string;
      message?: string;
    };

    if (!res.ok) {
      // Already registered — try login
      if (
        res.status === 422 ||
        (body.msg || body.message || "").toLowerCase().includes("already")
      ) {
        return passwordGrant(email, password);
      }
      const raw =
        body.error_description ||
        body.msg ||
        body.message ||
        body.error ||
        `HTTP ${res.status}`;
      return { ok: false, error: friendlyAuthError(raw) };
    }

    // Some projects return session tokens on signup
    if (body.access_token && body.refresh_token) {
      const supabase = await createClient();
      await supabase.auth.setSession({
        access_token: body.access_token,
        refresh_token: body.refresh_token,
      });
      return { ok: true };
    }

    // No session in signup response — sign in immediately
    return passwordGrant(email, password);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign up failed.";
    return { ok: false, error: friendlyAuthError(message) };
  }
}

export async function signInAction(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!getSupabaseEnv()) {
    return {
      ok: false,
      error:
        "Missing Supabase settings on the server. In Vercel → Settings → Environment Variables add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for this environment, then Redeploy.",
    };
  }
  return passwordGrant(email.trim(), password);
}

export async function signUpAction(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!getSupabaseEnv()) {
    return {
      ok: false,
      error:
        "Missing Supabase settings on the server. In Vercel → Settings → Environment Variables add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for this environment, then Redeploy.",
    };
  }
  return signUpGrant(email.trim(), password);
}
