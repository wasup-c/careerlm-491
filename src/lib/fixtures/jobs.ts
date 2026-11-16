// Synthetic JobOpportunity fixtures for automated tests only (SCRUM-164).
// Never imported by runtime pages: the job page reads Member 1's job
// search service. Companies, titles and URLs below are made up.

import type { JobOpportunity } from "@/lib/jobs";

/** Every optional field filled in. */
export const FULL_JOB: JobOpportunity = {
  providerJobId: "fixture-1001",
  title: "Junior Frontend Engineer",
  company: "Example Labs",
  location: "Los Angeles, CA",
  workplaceType: "hybrid",
  description:
    "Build accessible React interfaces with TypeScript and Tailwind CSS. Work with designers and backend engineers to ship features for a career-development product.",
  employmentType: "full-time",
  experienceLevel: "entry",
  skills: ["React", "TypeScript", "Tailwind CSS", "Testing"],
  salary: { min: 70000, max: 90000, currency: "USD", interval: "year" },
  applicationUrl: "https://jobs.example.com/apply/1001",
  source: "Jobicy",
  postedAt: "2026-11-03T00:00:00.000Z",
  retrievedAt: "2026-11-09T12:00:00.000Z",
};

/** Only the fields JobOpportunity always has. */
export const MINIMAL_JOB: JobOpportunity = {
  providerJobId: "fixture-1002",
  title: "Software Engineer",
  company: "Sample Co",
  workplaceType: "unspecified",
  skills: [],
  applicationUrl: "https://jobs.example.com/apply/1002",
  source: "Jobicy",
  retrievedAt: "2026-11-09T12:00:00.000Z",
};

/** Very long title, company and unbroken token, for layout checks. */
export const LONG_TEXT_JOB: JobOpportunity = {
  ...MINIMAL_JOB,
  providerJobId: "fixture-1003",
  title:
    "Senior Principal Staff Software Engineer, Distributed Systems, Platform Infrastructure, Developer Experience and Internal Tooling (Remote, Americas Time Zones Only)",
  company:
    "An Extremely Long Company Name Incorporated International Holdings Group LLC",
  skills: ["SupercalifragilisticexpialidociousFrameworkWithAVeryLongName"],
};
