import QuestionsList from "@/components/questionList";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-teal-50 px-4 py-10">
      <section className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-700">
            CareerLM Onboarding
          </p>

          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Build Your Personalized Career Roadmap
          </h1>

          <p className="mt-4 max-w-2xl text-slate-600">
            Tell CareerLM about your career goal, experience, available
            learning time, and priorities. Your responses will be used to
            prepare your personalized roadmap experience.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            All questions are required before continuing.
          </p>
        </header>

        <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
          <QuestionsList />
        </div>
      </section>
    </main>
  );
}