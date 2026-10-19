import type { ReactNode } from "react";
import Link from "next/link";

interface SharedLayoutProps {
  children: ReactNode;
}

const navLinkClass =
  "rounded text-sm text-slate-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export default function SharedLayout({ children }: SharedLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="rounded text-lg font-semibold tracking-tight text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            CareerLM
          </Link>
          <nav aria-label="Primary">
            <ul className="flex gap-5">
              <li><Link href="/explore" className={navLinkClass}>Explore</Link></li>
              <li><Link href="/dashboard" className={navLinkClass}>Dashboard</Link></li>
              <li><Link href="/roadmap" className={navLinkClass}>Roadmap</Link></li>
              <li><Link href="/portfolio" className={navLinkClass}>Portfolio</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1">
        <aside
          aria-hidden="true"
          className="hidden w-56 shrink-0 border-r border-slate-200 md:block"
        />
        <main className="flex-1 px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
