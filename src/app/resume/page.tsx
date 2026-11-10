// Résumé page — [S4-M2] résumé submission interface.
// Loads the current user's saved résumé on the server through
// CareerDataService; saving and deleting use server actions.

import type { Metadata } from "next";
import Link from "next/link";

import ResumeForm from "@/components/ResumeForm";
import SharedLayout from "@/components/SharedLayout";
import { loadSavedResume } from "@/lib/resumeSave";
import { careerDataService } from "@/lib/services";

import { deleteResumeAction, saveResumeAction } from "./actions";

export const metadata: Metadata = {
  title: "Résumé | CareerLM",
};

// Saved data changes per request, so never prerender this page at build time.
export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const resume = await loadSavedResume(careerDataService);

  return (
    <SharedLayout>
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Your résumé
        </h1>
        <p className="mt-3 text-slate-600">
          Save your résumé so CareerLM can use it for résumé feedback and job matching.
        </p>

        <div className="mt-8">
          <ResumeForm
            initialResume={resume}
            onSave={saveResumeAction}
            onDelete={deleteResumeAction}
          />
        </div>

        <p className="mt-6 text-sm text-slate-600">
          Your résumé is saved to your account only.{" "}
          <Link
            href="/dashboard"
            className="font-medium text-teal-700 underline underline-offset-2 hover:text-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          >
            Back to dashboard
          </Link>
        </p>
      </div>
    </SharedLayout>
  );
}
