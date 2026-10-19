"use client";

// Site-wide navigation bar. Lets users move between every main page
// from anywhere in the app, and marks the page they're on.

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/onboarding", label: "Questionnaire" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/portfolio", label: "Portfolio" },
] as const;

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-slate-900">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link
          href="/"
          className={`rounded text-lg font-semibold tracking-tight text-white ${focusRing}`}
        >
          CareerLM
        </Link>
        <nav aria-label="Primary">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {NAV_LINKS.map(({ href, label }) => {
              const isCurrent = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`rounded text-sm ${focusRing} ${
                      isCurrent
                        ? "font-semibold text-white underline underline-offset-4"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
