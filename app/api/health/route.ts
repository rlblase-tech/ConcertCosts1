import { NextResponse } from "next/server";
import { getSupabaseEnv } from "@/lib/env";

/** Quick check that Vercel has Supabase env vars (does not expose secrets). */
export async function GET() {
  const env = getSupabaseEnv();
  return NextResponse.json({
    ok: Boolean(env),
    hasUrl: Boolean(env?.url),
    hasKey: Boolean(env?.key),
    urlHost: env?.url ? new URL(env.url).host : null,
    hint: env
      ? "Env looks set. If login still fails, check Supabase Auth Site URL."
      : "Missing env vars. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then Redeploy.",
  });
}
