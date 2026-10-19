import type { ReactNode } from "react";
import NavBar from "./NavBar";

interface SharedLayoutProps {
  children: ReactNode;
}

export default function SharedLayout({ children }: SharedLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <NavBar />

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
