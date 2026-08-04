import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Redirect to /login when not signed in. Call at the top of protected pages. */
export async function requireUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    return { supabase, user };
  } catch {
    // Missing env, network issues, etc. — send them to login with a safe page
    redirect("/login");
  }
}
