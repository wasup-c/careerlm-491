import SharedLayout from "@/components/SharedLayout";

/** Shown automatically while the jobs page loads saved preferences. */
export default function JobsLoading() {
  return (
    <SharedLayout>
      <div role="status" aria-label="Loading job search" className="mx-auto w-full max-w-5xl">
        <div className="h-9 w-40 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
        <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-10 w-full animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
          <div className="mt-4 h-24 w-full animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
          <div className="mt-6 h-10 w-36 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
        </div>
      </div>
    </SharedLayout>
  );
}
