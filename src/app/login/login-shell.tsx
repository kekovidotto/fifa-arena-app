"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import LoginForm from "../authentication/components/login-form";
import SignUpForm from "../authentication/components/sign-up-form";

const AUTH_BG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAeQgGuEUYDpTrTeKrrPvlCs40MESPPRzLcqo4CXD8Jv267Kv8jkUefZuytgtZHVUIJ2utSQ4eM-1TlhHQ47ENEfHRz9l7yA9G0vpKVb2dMQfTQ_Co7bMq2CG6QqzD9be6BAS9f5_3DNW1NdrS6_mLyYC1wFz3043a-yOcjY6t68u2O922AwNSv9WS7oQKEsKNMAGojCPivdKPleaenjoNdH3KIqZ94L4OvLTs2XgI0IuD4yvkLACTLr1f4hi7Qua_r2BI36XmBpXo";

function MaterialIcon({
  name,
  className,
  filled,
}: {
  name: string;
  className?: string;
        filled?: boolean;
}) {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      style={
        filled
          ? ({ fontVariationSettings: "'FILL' 1, 'wght' 400" } as CSSProperties)
          : undefined
      }
      aria-hidden
    >
      {name}
    </span>
  );
}

export function LoginShell({ defaultTab }: { defaultTab: "login" | "register" }) {
  const isRegister = defaultTab === "register";

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-m3-background font-body text-on-surface selection:bg-m3-primary/30 selection:text-m3-primary">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(at_0%_0%,rgba(133,173,255,0.05)_0px,transparent_50%),radial-gradient(at_100%_100%,rgba(252,192,37,0.03)_0px,transparent_50%)]"
        aria-hidden
      />

      {!isRegister ? (
        <div className="pointer-events-none absolute inset-0 z-0 opacity-40" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={AUTH_BG}
            alt=""
            className="size-full object-cover brightness-50 grayscale"
          />
          <div className="absolute inset-0 bg-linear-to-t from-m3-background via-m3-background/80 to-transparent" />
        </div>
      ) : null}

      <header
        className={cn(
          "fixed top-0 z-50 w-full",
          isRegister
            ? "bg-linear-to-b from-surface-container-low to-transparent"
            : "flex items-center justify-center px-6 py-8",
        )}
      >
        {isRegister ? (
          <div className="flex w-full items-center justify-between px-6 py-6">
            <div className="flex items-center gap-3">
              <MaterialIcon
                name="sports_esports"
                className="text-3xl text-m3-primary"
                filled
              />
              <h1 className="font-headline text-2xl font-bold uppercase tracking-tighter text-m3-primary drop-shadow-[0_0_8px_rgba(133,173,255,0.5)]">
                NEXUS OVERDRIVE
              </h1>
            </div>
            <Link
              href="/login"
              className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant transition-colors hover:text-m3-primary"
            >
              Entrar
            </Link>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <MaterialIcon
              name="sports_esports"
              className="text-4xl text-m3-primary"
              filled
            />
            <h1 className="font-headline text-2xl font-bold tracking-tighter text-m3-primary drop-shadow-[0_0_8px_rgba(133,173,255,0.5)]">
              NEXUS OVERDRIVE
            </h1>
          </div>
        )}
      </header>

      <div
        className="pointer-events-none fixed top-1/4 -left-20 size-96 rounded-full bg-m3-primary/5 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed bottom-1/4 -right-20 size-96 rounded-full bg-tertiary/5 blur-[120px]"
        aria-hidden
      />

      <main
        className={cn(
          "relative z-10 flex w-full flex-1 flex-col",
          isRegister
            ? "items-center justify-center overflow-hidden px-6 pb-12 pt-24"
            : "items-center justify-center overflow-hidden px-6 py-12",
        )}
      >
        <Tabs key={defaultTab} defaultValue={defaultTab} className="w-full max-w-md">
          <TabsList className="sr-only">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Criar conta</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-0 outline-none">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register" className="mt-0 outline-none">
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </main>

      {!isRegister ? (
        <>
          <div className="fixed bottom-10 left-10 z-10 hidden lg:block">
            <div className="space-y-1">
              <p className="font-headline text-[10px] uppercase tracking-[0.4em] text-m3-primary/40">
                Status do Sistema
              </p>
              <div className="flex items-center space-x-2">
                <div className="size-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <p className="font-label text-xs font-bold text-on-surface">ARENA ONLINE</p>
              </div>
            </div>
          </div>
          <div className="fixed bottom-10 right-10 z-10 hidden text-right lg:block">
            <div className="space-y-1">
              <p className="font-headline text-[10px] uppercase tracking-[0.4em] text-m3-primary/40">
                Criptografia
              </p>
              <p className="font-label text-xs font-bold text-on-surface">AES-256 NEXUS-SHIFT</p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
