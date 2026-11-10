"use client";

import Link from "next/link";

import {
  useRef,
  useState,
} from "react";

export default function LogoutButton() {
  const homeLinkRef =
    useRef<HTMLAnchorElement>(
      null
    );

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setErrorMessage("");

    try {
      const response =
        await fetch(
          "/api/auth/logout",
          {
            method: "POST",
          }
        );

      if (!response.ok) {
        setErrorMessage(
          "Unable to log out."
        );

        return;
      }

      homeLinkRef
        .current
        ?.click();
    } catch {
      setErrorMessage(
        "Unable to log out."
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={
          handleLogout
        }
        disabled={
          isLoggingOut
        }
        className="rounded border border-slate-500 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:border-white hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoggingOut
          ? "Logging out..."
          : "Log out"}
      </button>

      {errorMessage && (
        <span
          role="alert"
          className="text-xs text-red-300"
        >
          {
            errorMessage
          }
        </span>
      )}

      <Link
        ref={
          homeLinkRef
        }
        href="/"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
      >
        Return home
      </Link>
    </div>
  );
}