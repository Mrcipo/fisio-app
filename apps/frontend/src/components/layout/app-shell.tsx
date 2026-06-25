"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen nav:flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 nav:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 flex-1">
        <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
