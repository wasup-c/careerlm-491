"use client";

import type {
  FormEvent,
} from "react";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

interface AuthFormProps {
  mode:
    | "login"
    | "register";
}

type AuthApiResponse =
  | {
      success: true;
      user: {
        id: string;
        email: string;
      };
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

export default function AuthForm({
  mode,
}: AuthFormProps) {
  const router =
    useRouter();

  const [email, setEmail] =
    useState("");

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);

  const isRegister =
    mode === "register";

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrorMessage("");

    if (
      isRegister &&
      password !==
        confirmPassword
    ) {
      setErrorMessage(
        "Passwords do not match."
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint =
        isRegister
          ? "/api/auth/register"
          : "/api/auth/login";

      const response =
        await fetch(
          endpoint,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                email,
                password,
              }),
          }
        );

      let body:
        AuthApiResponse | null =
        null;

      try {
        body =
          (await response.json()) as
            AuthApiResponse;
      } catch {
        body = null;
      }

      if (
        !response.ok ||
        !body ||
        !body.success
      ) {
        const message =
          body &&
          !body.success
            ? body.error.message
            : "CareerLM could not complete authentication. Please try again.";

        setErrorMessage(
          message
        );

        return;
      }

      router.replace(
        isRegister
          ? "/onboarding"
          : "/dashboard"
      );

      router.refresh();
    } catch {
      setErrorMessage(
        "Unable to reach CareerLM right now. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      noValidate
      className="mt-8 space-y-5"
    >
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-slate-800"
        >
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(
            event
          ) =>
            setEmail(
              event.target
                .value
            )
          }
          disabled={
            isSubmitting
          }
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200 disabled:bg-slate-100"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-slate-800"
        >
          Password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete={
            isRegister
              ? "new-password"
              : "current-password"
          }
          required
          minLength={8}
          value={
            password
          }
          onChange={(
            event
          ) =>
            setPassword(
              event.target
                .value
            )
          }
          disabled={
            isSubmitting
          }
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200 disabled:bg-slate-100"
        />

        {isRegister && (
          <p className="mt-2 text-xs text-slate-500">
            Use at least 8
            characters. CareerLM
            accepts passwords up
            to 72 UTF-8 bytes.
          </p>
        )}
      </div>

      {isRegister && (
        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-semibold text-slate-800"
          >
            Confirm password
          </label>

          <input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={
              confirmPassword
            }
            onChange={(
              event
            ) =>
              setConfirmPassword(
                event.target
                  .value
              )
            }
            disabled={
              isSubmitting
            }
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200 disabled:bg-slate-100"
          />
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800"
        >
          {
            errorMessage
          }
        </div>
      )}

      <button
        type="submit"
        disabled={
          isSubmitting
        }
        className="w-full rounded-md bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:bg-teal-400"
      >
        {isSubmitting
          ? isRegister
            ? "Creating account..."
            : "Logging in..."
          : isRegister
            ? "Create account"
            : "Log in"}
      </button>
    </form>
  );
}