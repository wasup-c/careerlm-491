"use client";

// Site-wide navigation bar. Lets authenticated users move between
// CareerLM's primary application pages and end their current session.

import Link from "next/link";
import {
  usePathname,
} from "next/navigation";

import LogoutButton from "./LogoutButton";

export const NAV_LINKS = [
  {
    href: "/explore",
    label: "Explore",
  },
  {
    href: "/onboarding",
    label: "Questionnaire",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
  },
  {
    href: "/roadmap",
    label: "Roadmap",
  },
  {
    href: "/portfolio",
    label: "Portfolio",
  },
  {
    href: "/resume",
    label: "Résumé",
  },
] as const;

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export default function NavBar() {
  const pathname =
    usePathname();

  return (
    <header className="border-b border-slate-200 bg-slate-900">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className={`rounded text-lg font-semibold tracking-tight text-white ${focusRing}`}
        >
          CareerLM
        </Link>

        <div className="flex flex-wrap items-center gap-5">
          <nav aria-label="Primary">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {NAV_LINKS.map(
                ({
                  href,
                  label,
                }) => {
                  const isCurrent =
                    pathname ===
                    href;

                  return (
                    <li
                      key={
                        href
                      }
                    >
                      <Link
                        href={
                          href
                        }
                        aria-current={
                          isCurrent
                            ? "page"
                            : undefined
                        }
                        className={`rounded text-sm ${focusRing} ${
                          isCurrent
                            ? "font-semibold text-white underline underline-offset-4"
                            : "text-slate-300 hover:text-white"
                        }`}
                      >
                        {
                          label
                        }
                      </Link>
                    </li>
                  );
                }
              )}
            </ul>
          </nav>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}