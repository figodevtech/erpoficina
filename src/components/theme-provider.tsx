// src/components/theme-provider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

type NextThemesProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider(props: NextThemesProps) {
  return <NextThemesProvider {...props} />;
}

/**
 * Providers: componente que engloba SessionProvider + ThemeProvider.
 * - session?: opcional (caso queira passar initialSession no futuro).
 * - props são repassados para next-themes ThemeProvider.
 */
export function Providers({
  children,
  session,
  ...props
}: {
  children: React.ReactNode;
  session?: Session | null;
} & NextThemesProps) {
  return (
    <SessionProvider session={session}>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </SessionProvider>
  );
}
