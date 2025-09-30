import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/theme-provider";
import NProgressHandler from "@/components/NProgressHandler";


export const metadata: Metadata = {
  title: "ERP",
  description: "Erp Oficina",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Providers inclui SessionProvider + ThemeProvider */}
        <Providers attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NProgressHandler />
          {children}
        </Providers>
      </body>
    </html>
  );
}
