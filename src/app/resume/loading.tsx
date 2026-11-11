import SharedLayout from "@/components/SharedLayout";

/**
 * Résumé loading state. Next.js shows this automatically while the
 * résumé page is loading the saved résumé.
 */
export default function ResumeLoading() {
  return (
    <SharedLayout>
      <div role="status" aria-label="Loading your résumé" className="mx-auto w-full max-w-3xl">
        <div className="h-9 w-48 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
        <div className="mt-4 h-5 w-80 max-w-full animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
          <div className="mt-6 h-64 w-full animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
          <div className="mt-6 h-10 w-36 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
        </div>
      </div>
    </SharedLayout>
  );
}
