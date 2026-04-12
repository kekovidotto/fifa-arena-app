import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Manrope, Space_Grotesk } from "next/font/google";
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

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Material Symbols não existe em next/font; sem este link os glifos aparecem como texto (ex.: add_circle). */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${inter.variable} ${manrope.variable} antialiased`}
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
