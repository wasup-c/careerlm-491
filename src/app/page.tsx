import Link from "next/link";

/**
 * CareerLM landing page — matches the team's Figma mockup:
 * centered serif wordmark, tagline, and a single call to action that
 * leads to the navigation page.
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-[#EAECF1] px-6 py-16 text-center text-[#2B3352] sm:py-24">
      <h1 className="font-serif text-5xl font-bold tracking-tight sm:text-6xl">
        CareerLM
      </h1>

      <p className="mt-12 max-w-2xl text-xl leading-relaxed sm:mt-16 sm:text-2xl">
        Career Guidance made easy, thanks to AI!
      </p>

      <Link
        href="/explore"
        className="mt-20 inline-flex min-w-64 items-center justify-center rounded-md bg-[#2B3352] px-8 py-3.5 text-lg text-white shadow-sm transition-colors hover:bg-[#1E2440] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2B3352] sm:mt-32"
      >
        Start your journey!
      </Link>
    </main>
  );
}
