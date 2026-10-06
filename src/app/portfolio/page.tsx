import Link from "next/link";

import SharedLayout from "@/components/SharedLayout";
import { mockRoadmap } from "@/lib/mockRoadmap";
import { getCompletedPortfolioWork } from "@/lib/portfolioJourney";

export default function PortfolioPage() {
  const completedWork = getCompletedPortfolioWork(mockRoadmap);

  return (
    <SharedLayout>
      <section className="mx-auto w-full max-w-3xl">
        <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            CareerLM Portfolio
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Your completed work
          </h1>

          <p className="mt-3 text-slate-600">
            Completed roadmap milestones appear here so you can track the
            skills and accomplishments you have built along your career path.
          </p>

          <Link
            href="/roadmap"
            className="mt-6 inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Back to roadmap
          </Link>
        </header>

        {completedWork.length === 0 ? (
          <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              No completed work yet
            </h2>

            <p className="mt-2 text-slate-600">
              Complete roadmap milestones to start building your portfolio.
            </p>
          </section>
        ) : (
          <section className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Completed roadmap work
            </h2>

            {completedWork.map((milestone) => (
              <article
                key={
                  milestone.id ??
                  `${milestone.order}-${milestone.title}`
                }
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-semibold text-teal-700">
                  Completed milestone
                </p>

                <h3 className="mt-2 text-xl font-semibold text-slate-900">
                  {milestone.title}
                </h3>

                <p className="mt-2 text-slate-600">
                  {milestone.description}
                </p>

                {milestone.skills.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Skills developed
                    </p>

                    <ul className="mt-2 flex flex-wrap gap-2">
                      {milestone.skills.map((skill) => (
                        <li
                          key={skill}
                          className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </section>
    </SharedLayout>
  );
}