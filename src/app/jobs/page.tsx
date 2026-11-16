// Jobs page — SCRUM-263 [S5-M2] job search and results.
// Requires a signed-in user, prefills the search form from their saved job
// preferences (or their target role), and searches only when they submit.

import type { Metadata } from "next";

import JobSearch from "@/components/JobSearch";
import SharedLayout from "@/components/SharedLayout";
import { requireAuthenticatedPageUser } from "@/lib/auth/require-authenticated-page-user";
import { loadJobSearchPage } from "@/lib/jobSearch";
import { careerDataService } from "@/lib/services";

import { searchJobsAction } from "./actions";

export const metadata: Metadata = {
  title: "Jobs | CareerLM",
};

// Saved preferences change per request, so never prerender this page.
export const dynamic = "force-dynamic";

export default async function JobsPage() {
  // Signed-out users are redirected to /login (same as the other pages).
  await requireAuthenticatedPageUser();

  const { initialValues, hasSavedPreferences } = await loadJobSearchPage(careerDataService);

  return (
    <SharedLayout>
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Find jobs
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Search current job listings that fit your goals. Your search preferences are saved to
          your account so CareerLM can use them for matching.
        </p>

        <div className="mt-8">
          <JobSearch
            initialValues={initialValues}
            hasSavedPreferences={hasSavedPreferences}
            onSearch={searchJobsAction}
          />
        </div>
      </div>
    </SharedLayout>
  );
}
