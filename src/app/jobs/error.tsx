"use client";

import { useRouter } from "next/navigation";

import ErrorState from "@/components/ErrorState";
import SharedLayout from "@/components/SharedLayout";

/** Shown if the jobs page itself can't load. Never shows internal details. */
export default function JobsError({ reset }: { reset: () => void }) {
  const router = useRouter();

  return (
    <SharedLayout>
      <div role="alert" className="mx-auto w-full max-w-3xl py-12">
        <ErrorState
          title="We couldn't load job search"
          message="Something went wrong loading this page. Try again, or come back in a moment."
          onRetry={() => {
            router.refresh();
            reset();
          }}
        />
      </div>
    </SharedLayout>
  );
}
