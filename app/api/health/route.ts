import { NextResponse } from "next/server";
import { getSupabaseEnv, probeSupabase } from "@/lib/env";

/** Open this on your Vercel site to see if env + Supabase connectivity work. */
export async function GET() {
  const env = getSupabaseEnv();
  const probe = await probeSupabase();

  return NextResponse.json({
    ok: probe.ok,
    hasUrl: Boolean(env?.url),
    hasKey: Boolean(env?.key),
    keyLength: env?.key?.length ?? 0,
    urlHost: env?.url
      ? (() => {
          try {
            return new URL(env.url).host;
          } catch {
            return "invalid-url";
          }
        })()
      : null,
    probe: probe.detail,
    hint: probe.ok
      ? "Supabase is reachable. If login still fails, check email/password or Confirm email setting."
      : "Fix env vars or network, then Redeploy. Values must match Supabase Project Settings → API.",
  });
}
