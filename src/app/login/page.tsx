import type {
    Metadata,
  } from "next";
  
  import Link from "next/link";
  
  import AuthForm from "@/components/AuthForm";
  
  export const metadata:
    Metadata = {
      title:
        "Log in | CareerLM",
    };
  
  export default function LoginPage() {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#EAECF1] px-6 py-12 text-[#2B3352]">
        <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
          <Link
            href="/"
            className="text-sm underline underline-offset-4"
          >
            Back to CareerLM
          </Link>
  
          <h1 className="mt-8 font-serif text-4xl font-bold">
            Log in
          </h1>
  
          <p className="mt-3 text-slate-600">
            Continue your saved
            CareerLM journey.
          </p>
  
          <AuthForm
            mode="login"
          />
  
          <p className="mt-6 text-center text-sm text-slate-600">
            Need an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-teal-700 underline underline-offset-4"
            >
              Create one
            </Link>
          </p>
        </section>
      </main>
    );
  }