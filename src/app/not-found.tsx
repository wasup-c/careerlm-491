import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-3xl font-bold">
        Page Not Found
      </h1>

      <p className="mt-4 text-gray-600">
        The page you're looking for doesn't exist or may have moved.
      </p>

      <Link
        href="/"
        className="mt-6 inline-block rounded bg-blue-600 px-4 py-2 text-white"
      >
        Return Home
      </Link>
    </main>
  );
}