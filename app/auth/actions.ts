"use server";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/env";

export type AuthResult = { ok: true } | { ok: false; error: string };

function friendlyAuthError(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes("fetch") || msg.includes("network") || msg.includes("econnrefused")) {
    return "Server could not reach Supabase. On Vercel set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then Redeploy. Also check Supabase Authentication → URL Configuration (Site URL = your Vercel link).";
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

export async function signInAction(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!getSupabaseEnv()) {
    return {
      ok: false,
      error:
        "Missing Supabase settings on the server. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables, then Redeploy.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) return { ok: false, error: friendlyAuthError(error.message) };
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign in failed.";
    return { ok: false, error: friendlyAuthError(message) };
  }
}

export async function signUpAction(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!getSupabaseEnv()) {
    return {
      ok: false,
      error:
        "Missing Supabase settings on the server. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables, then Redeploy.",
    };
  }

  try {
    const supabase = await createClient();
    const emailTrimmed = email.trim();

    const { data, error } = await supabase.auth.signUp({
      email: emailTrimmed,
      password,
    });

    if (error) {
      // Maybe already registered — try sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: emailTrimmed,
        password,
      });
      if (!signInError) return { ok: true };
      return {
        ok: false,
        error: friendlyAuthError(error.message || signInError.message),
      };
    }

    if (data.session) return { ok: true };

    // No session yet (e.g. confirm email) — try immediate login
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: emailTrimmed,
      password,
    });
    if (!signInError) return { ok: true };

    return {
      ok: false,
      error:
        "Account created, but you still need to sign in. If it fails, turn off Confirm email in Supabase Auth settings.",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign up failed.";
    return { ok: false, error: friendlyAuthError(message) };
  }
}
