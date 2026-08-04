/** Clean env values pasted into Vercel (quotes, newlines, zero-width chars). */
function cleanEnv(value: string | undefined): string {
  if (!value) return "";
  return value
    .replace(/^\uFEFF/, "") // BOM
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim()
    .replace(/\/$/, ""); // no trailing slash on URL
}

/** Read Supabase settings from env. */
export function getSupabaseEnv(): { url: string; key: string } | null {
  const url = cleanEnv(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  );
  const key = cleanEnv(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  if (!url || !key) return null;
  return { url, key };
}

export function requireSupabaseEnv(): { url: string; key: string } {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY on the server."
    );
  }
  // Validate shape
  if (!env.url.startsWith("https://") || !env.url.includes("supabase")) {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL looks wrong (got "${env.url.slice(0, 40)}…"). It should look like https://xxxx.supabase.co`
    );
  }
  if (env.key.length < 20) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY looks too short. Paste the full anon public key from Supabase."
    );
  }
  return env;
}

export async function probeSupabase(): Promise<{
  ok: boolean;
  detail: string;
}> {
  const env = getSupabaseEnv();
  if (!env) {
    return {
      ok: false,
      detail:
        "Env vars missing on this deploy. Add NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then Redeploy.",
    };
  }

  try {
    const res = await fetch(`${env.url}/auth/v1/health`, {
      headers: {
        apikey: env.key,
        Authorization: `Bearer ${env.key}`,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        ok: false,
        detail: `Supabase health returned HTTP ${res.status}. Check the URL and anon key.`,
      };
    }
    return { ok: true, detail: `Reachable (${new URL(env.url).host})` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const cause =
      err instanceof Error && err.cause instanceof Error
        ? err.cause.message
        : "";
    return {
      ok: false,
      detail: `Network error reaching Supabase: ${msg}${cause ? ` (${cause})` : ""}`,
    };
  }
}
