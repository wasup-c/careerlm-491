import type {
    Metadata,
  } from "next";
  
  import Link from "next/link";
  
  import AuthForm from "@/components/AuthForm";
  
  export const metadata:
    Metadata = {
      title:
        "Create account | CareerLM",
    };
  
  export default function RegisterPage() {
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
            Create your account
          </h1>
  
          <p className="mt-3 text-slate-600">
            Save your roadmap,
            progress, profile, and
            CareerLM activity under
            your own account.
          </p>
  
          <AuthForm
            mode="register"
          />
  
          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an
            account?{" "}
            <Link
              href="/login"
              className="font-semibold text-teal-700 underline underline-offset-4"
            >
              Log in
            </Link>
          </p>
        </section>
      </main>
    );
  }