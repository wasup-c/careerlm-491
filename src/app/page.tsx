import Link from "next/link";
import SharedLayout from "@/components/SharedLayout";

export default function Home() {
  return (
    <SharedLayout>
      <div className="mx-auto flex max-w-2xl flex-col items-start gap-6 py-12">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          CareerLM
        </h1>

        <p className="max-w-prose text-lg leading-relaxed text-slate-600">
          CareerLM helps you turn a fuzzy sense of &ldquo;what&rsquo;s
          next&rdquo; into a concrete plan &mdash; matching your background
          and goals to real roles, then mapping the skills and steps to get
          there.
        </p>

        <Link
          href="/onboarding"
          className="inline-flex items-center rounded-md bg-teal-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        >
          Start Your Journey
        </Link>
      </div>
    </SharedLayout>
  );
}
