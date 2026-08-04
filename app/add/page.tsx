import { AppShell } from "@/components/AppShell";
import { ConcertForm } from "@/components/ConcertForm";
import { requireUser } from "@/lib/auth";

export default async function AddConcertPage() {
  const { user } = await requireUser();

  return (
    <AppShell user={user}>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content drop-shadow-md">
            Add Concert
          </h2>
          <p className="text-base-content/80 text-sm sm:text-base drop-shadow-sm">
            Artist, venue, ticket cost, concert fun, and venue fun score
          </p>
        </div>
        <ConcertForm />
      </div>
    </AppShell>
  );
}
