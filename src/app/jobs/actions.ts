"use server";

import { runJobSearch, type JobSearchResult } from "@/lib/jobSearch";
import type { JobSearchFormValues } from "@/lib/jobSearchForm";
import { careerDataService } from "@/lib/services";

// The browser sends only the search form. CareerDataService resolves the
// current user on the server and calls the job provider; no user ID or
// provider request ever comes from the client.

export async function searchJobsAction(
  values: JobSearchFormValues,
): Promise<JobSearchResult> {
  return runJobSearch(careerDataService, values);
}
