// src/app/(app)/(shell)/layout.tsx
import type { ReactNode } from "react";
import ClientAppShell from "./ClientAppShell";

export default function ShellLayout({ children }: { children: ReactNode }) {
  return <ClientAppShell>{children}</ClientAppShell>;
}