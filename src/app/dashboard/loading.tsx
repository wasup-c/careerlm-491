import SharedLayout from "@/components/SharedLayout";

/**
 * Dashboard loading state. Next.js shows this automatically while the
 * dashboard route is loading its data.
 */
export default function DashboardLoading() {
  return (
    <SharedLayout>
      <div
        role="status"
        aria-label="Loading your dashboard"
        className="mx-auto w-full max-w-3xl"
      >
        <div className="h-9 w-56 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
        <div className="mt-4 h-5 w-80 max-w-full animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[0, 1].map((card) => (
            <div
              key={card}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="h-5 w-32 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
              <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
              <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
            </div>
          ))}
        </div>

        <span className="sr-only">Loading your dashboard…</span>
      </div>
    </SharedLayout>
  );
}
