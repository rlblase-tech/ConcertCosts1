import Link from "next/link";
import { Music2 } from "lucide-react";

type Props = {
  title?: string;
  message?: string;
  showAddLink?: boolean;
};

export function EmptyState({
  title = "No concerts logged yet",
  message = "No concerts logged yet. Add your first concert to start seeing your dashboard.",
  showAddLink = true,
}: Props) {
  return (
    <div className="card bg-base-100 shadow-md border border-base-300">
      <div className="card-body items-center text-center py-12 px-6 gap-3">
        <div className="rounded-full bg-primary/10 p-4 text-primary">
          <Music2 className="h-10 w-10" />
        </div>
        <h2 className="card-title text-xl">{title}</h2>
        <p className="text-base-content/70 max-w-md">{message}</p>
        {showAddLink && (
          <Link href="/add" className="btn btn-primary mt-2">
            Add your first concert
          </Link>
        )}
      </div>
    </div>
  );
}
