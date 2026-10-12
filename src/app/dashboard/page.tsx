// Dashboard page shell — SCRUM-139 [S3-M2]
// Target role and progress come from the current roadmap (the same source
// as /roadmap) using Member 4's progress calculation. Name, experience
// level, and profile saves stay mocked until Member 3's profile service exists.

import type { Metadata } from "next";
import Link from "next/link";
import ProfileSection from "@/components/ProfileSection";
import ProgressCard from "@/components/ProgressCard";
import SharedLayout from "@/components/SharedLayout";
import { getDashboardData } from "@/lib/dashboardData";

export const metadata: Metadata = {
  title: "Dashboard | CareerLM",
};

export default function DashboardPage() {
  const { profile, progress } = getDashboardData();

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
          <ProfileSection initialProfile={profile} />

          <ProgressCard progress={progress} />
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
              <Link
                href="/portfolio"
                className="inline-flex items-center rounded-md border border-teal-600 px-5 py-2.5 font-medium text-teal-700 transition-colors hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
              >
                View portfolio
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </SharedLayout>
  );
}

