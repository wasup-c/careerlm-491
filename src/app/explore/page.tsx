import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Get started | CareerLM",
};

interface Destination {
  href: string;
  title: string;
  description: string;
}

const destinations: Destination[] = [
  {
    href: "/onboarding",
    title: "Take the questionnaire",
    description:
      "Answer a few questions about your goals and experience to build your personalized roadmap.",
  },
  {
    href: "/dashboard",
    title: "Dashboard",
    description: "See your profile and how far along your roadmap you are.",
  },
  {
    href: "/roadmap",
    title: "Roadmap",
    description: "Follow your milestones step by step toward your target role.",
  },
  {
    href: "/portfolio",
    title: "Portfolio",
    description: "Review the milestones you've completed and the skills you've built.",
  },
];

/**
 * Navigation page reached from the landing page. Lists the main areas
 * of CareerLM in the same visual style as the Figma mockup.
 */
export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-[#EAECF1] px-6 py-16 text-[#2B3352] sm:py-20">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="rounded-sm text-sm underline underline-offset-4 hover:text-[#1E2440] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B3352]"
        >
          Back to home
        </Link>

        <h1 className="mt-8 text-center font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          Where would you like to go?
        </h1>

        <p className="mt-4 text-center text-lg">
          New here? Start with the questionnaire.
        </p>

        <nav aria-label="CareerLM sections" className="mt-12">
          <ul className="grid gap-5 sm:grid-cols-2">
            {destinations.map((destination) => (
              <li key={destination.href}>
                <Link
                  href={destination.href}
                  className="flex h-full flex-col rounded-lg border border-slate-300 bg-white/60 p-6 shadow-md transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B3352] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <span className="font-serif text-xl font-bold">
                    {destination.title}
                  </span>
                  <span className="mt-2 text-base leading-relaxed text-slate-600">
                    {destination.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
