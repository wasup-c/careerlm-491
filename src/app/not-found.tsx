import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold">
        404 - Page Not Found
      </h1>

      <p className="mt-4 text-gray-600">
<<<<<<< HEAD
        The page you're looking for doesn't exist or may have moved.
=======
        We couldn&apos;t find what you&apos;re looking for.
>>>>>>> 22c3181449c5ed915be6454f6f1212059d3306cc
      </p>

      <Link
        href="/"
        className="mt-6 rounded bg-blue-600 px-4 py-2 text-white"
      >
        Return Home
      </Link>
    </main>
  );
}
