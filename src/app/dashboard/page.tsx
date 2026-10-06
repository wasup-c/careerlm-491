// Dashboard page shell — SCRUM-139 [S3-M2]
// Placeholder sections only. Profile, progress, and profile-edit
// components will replace the placeholders in later commits.

import type { Metadata } from "next";
import Link from "next/link";
import SharedLayout from "@/components/SharedLayout";

export const metadata: Metadata = {
  title: "Dashboard | CareerLM",
};

export default function DashboardPage() {
  return (
    <SharedLayout>
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Your dashboard
        </h1>
        <p className="mt-3 text-slate-600">
          Check your profile and roadmap progress, then pick up where you left
          off.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section
            aria-labelledby="profile-heading"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2
              id="profile-heading"
              className="text-lg font-semibold text-slate-900"
            >
              Profile
            </h2>
            <p className="mt-2 text-slate-600">
              Your profile details will appear here.
            </p>
          </section>

          <section
            aria-labelledby="progress-heading"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2
              id="progress-heading"
              className="text-lg font-semibold text-slate-900"
            >
              Roadmap progress
            </h2>
            <p className="mt-2 text-slate-600">
              Your roadmap progress will appear here.
            </p>
          </section>
        </div>

        <nav aria-labelledby="shortcuts-heading" className="mt-8">
          <h2
            id="shortcuts-heading"
            className="text-lg font-semibold text-slate-900"
          >
            Go to
          </h2>
          <ul className="mt-3 flex flex-col gap-3 sm:flex-row">
            <li>
              <Link
                href="/roadmap"
                className="inline-flex items-center rounded-md bg-teal-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
              >
                View roadmap
              </Link>
            </li>
            <li>
              {/* No /portfolio route exists yet (Member 5). Swap this for a
                  Link once the page is merged. */}
              <span
                aria-disabled="true"
                className="inline-flex items-center rounded-md border border-slate-300 px-5 py-2.5 font-medium text-slate-400"
              >
                Portfolio (coming soon)
              </span>
            </li>
          </ul>
        </nav>
      </div>
    </SharedLayout>
  );
}

