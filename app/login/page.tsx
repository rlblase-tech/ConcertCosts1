import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  // If already signed in, go to dashboard (no middleware needed)
  if (getSupabaseEnv()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) redirect("/");
    } catch {
      // stay on login
    }
  }

  return <LoginForm />;
}
