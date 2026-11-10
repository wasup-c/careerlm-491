import Link from "next/link";

/**
 * CareerLM landing page.
 *
 * New users can begin by creating an account, while returning users
 * can log in and continue their saved CareerLM journey.
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

      <div className="mt-20 flex flex-col items-center gap-4 sm:mt-32 sm:flex-row">
        <Link
          href="/register"
          className="inline-flex min-w-64 items-center justify-center rounded-md bg-[#2B3352] px-8 py-3.5 text-lg text-white shadow-sm transition-colors hover:bg-[#1E2440] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2B3352]"
        >
          Start your journey!
        </Link>

        <Link
          href="/login"
          className="inline-flex min-w-64 items-center justify-center rounded-md border-2 border-[#2B3352] bg-transparent px-8 py-3 text-lg font-medium text-[#2B3352] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2B3352]"
        >
          Log in
        </Link>
      </div>

      <p className="mt-5 text-sm text-slate-600">
        New to CareerLM? Start your journey to create your account.
      </p>
    </main>
  );
}