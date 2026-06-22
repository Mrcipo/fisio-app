import type { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
