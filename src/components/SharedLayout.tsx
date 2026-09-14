import type { ReactNode } from "react";

interface SharedLayoutProps {
  children: ReactNode;
}

export default function SharedLayout({ children }: SharedLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight text-white">
            CareerLM
          </span>
          {/* Placeholder for future nav links (Dashboard, Roadmap, Profile, etc.) */}
          <nav aria-label="Primary" className="hidden sm:block">
            <span className="text-sm text-slate-400">Nav coming soon</span>
          </nav>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1">
        {/* Sidebar placeholder — reserved for future navigation/filters */}
        <aside
          aria-hidden="true"
          className="hidden w-56 shrink-0 border-r border-slate-200 md:block"
        />

        {/* Main content area */}
        <main className="flex-1 px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
