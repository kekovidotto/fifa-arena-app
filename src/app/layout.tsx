import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";

import { AppChrome } from "@/components/layout/app-chrome";
import { Toaster } from "@/components/ui/sonner";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FIFA Arena - Copa do Mundo de Videogame",
  description:
    "Organize campeonatos de futebol de videogame no formato Copa do Mundo.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppChrome
          viewerIsAdmin={isAdmin(session?.user?.email)}
          viewerUserId={session?.user?.id ?? null}
        >
          {children}
        </AppChrome>
        <Toaster position="bottom-center" richColors theme="light" />
      </body>
    </html>
  );
}
