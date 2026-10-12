"use client";

import { useRouter } from "next/navigation";

import ErrorState from "@/components/ErrorState";
import SharedLayout from "@/components/SharedLayout";

/**
 * Shown when the dashboard can't load the user's saved data.
 */
export default function DashboardError({ reset }: { reset: () => void }) {
  const router = useRouter();

  return (
    <SharedLayout>
      <div role="alert" className="mx-auto w-full max-w-3xl py-12">
        <ErrorState
          title="We couldn't load your dashboard"
          message="Your saved profile and roadmap couldn't be loaded. Try again, or come back in a moment."
          onRetry={() => {
            router.refresh();
            reset();
          }}
        />
      </div>
    </SharedLayout>
  );
}
