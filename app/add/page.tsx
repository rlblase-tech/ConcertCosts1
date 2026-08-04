import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ConcertForm } from "@/components/ConcertForm";
import { createClient } from "@/lib/supabase/server";

export default async function AddConcertPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <AppShell user={user}>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Add Concert</h2>
          <p className="text-base-content/60 text-sm sm:text-base">
            Save the details, costs, and fun rating for a show you attended
          </p>
        </div>
        <ConcertForm />
      </div>
    </AppShell>
  );
}
