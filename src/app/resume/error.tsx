"use client";

import { useRouter } from "next/navigation";

import ErrorState from "@/components/ErrorState";
import SharedLayout from "@/components/SharedLayout";

/**
 * Shown when the résumé page can't load the user's saved résumé.
 * The message never includes résumé content or internal details.
 */
export default function ResumeError({ reset }: { reset: () => void }) {
  const router = useRouter();

  return (
    <SharedLayout>
      <div role="alert" className="mx-auto w-full max-w-3xl py-12">
        <ErrorState
          title="We couldn't load your résumé"
          message="Your saved résumé couldn't be loaded. Try again, or come back in a moment."
          onRetry={() => {
            router.refresh();
            reset();
          }}
        />
      </div>
    </SharedLayout>
  );
}
