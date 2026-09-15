"use client";

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
  onNavigate?: () => void;
  navigationLabel?: string;
}

export default function ErrorState({
  title,
  message,
  onRetry,
  onNavigate,
  navigationLabel = "Go Back",
}: ErrorStateProps) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold">
        {title}
      </h2>

      <p className="mt-3 text-gray-600">
        {message}
      </p>

      <div className="mt-6 flex justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Try Again
          </button>
        )}

        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="rounded border px-4 py-2"
          >
            {navigationLabel}
          </button>
        )}
      </div>
    </div>
  );
}