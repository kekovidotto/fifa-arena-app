import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const HERO_IMAGE_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDdvNNcjKlabWQtB7riF_N_KwuxuXbbsMVa1I8e0w1I1ULidiPjTDPvVAHFVIFGCSPC35PT-fFUUcmUPVxj6W3OaMD5zB0ww_MyKRfCi9cDTjsBxB2co2AVYSc9ZXFb2WIzczybTtPD17hpV2IFVt8ffANIeX_ZX5pyqkCyNSAcy4CCU7uTacIWdMGU9eqmOEWAj6U8sLOcll4eoGTokjptjKA_Wk0Kgl0u7SgYa82ncHgimGwEy_9IKA-qUZ3Bqkkrw7L4DCz9Ueo";

function MaterialSymbol({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      aria-hidden
    >
      {name}
    </span>
  );
}

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isLoggedIn = Boolean(session?.user);
  const arenaHref = isLoggedIn ? "/dashboard" : "/login";
  const menuHref = isLoggedIn ? "/dashboard" : "/login";

  return (
    <div className="min-h-[max(884px,100dvh)] overflow-x-hidden bg-surface font-body text-on-surface">
      <header className="absolute top-0 z-50 flex h-20 w-full items-center justify-between bg-transparent px-6 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link
            href={menuHref}
            className="text-m3-primary transition-opacity hover:opacity-80"
            aria-label={isLoggedIn ? "Abrir app" : "Entrar"}
          >
            <MaterialSymbol name="menu" className="text-2xl" />
          </Link>
          <Link
            href="/"
            className="font-headline text-2xl font-black italic tracking-tighter text-m3-primary"
          >
            ULTIMATE XI
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="size-2 animate-pulse rounded-full bg-m3-primary shadow-[0_0_8px_#85adff]"
            aria-hidden
          />
          <span className="font-label text-[10px] font-bold uppercase tracking-widest text-m3-primary">
            SERVER: ONLINE
          </span>
        </div>
      </header>

      <main className="relative flex h-dvh min-h-[884px] w-full flex-col justify-center overflow-hidden bg-mesh">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMAGE_SRC}
            alt="Atmosfera de estádio com luzes neon em azul e teal, jogadores em destaque na arena digital."
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/40 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-4xl px-8 text-center">
          <div className="mb-12">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-[2px] w-12 bg-m3-primary" aria-hidden />
              <span className="font-label text-xs font-extrabold uppercase tracking-[0.3em] text-m3-primary">
                E-Sports Elite System
              </span>
              <span className="h-[2px] w-12 bg-m3-primary" aria-hidden />
            </div>
            <h1 className="font-headline text-6xl font-black italic leading-none tracking-tighter text-on-surface drop-shadow-2xl md:text-8xl">
              NEXUS
              <br />
              OVERDRIVE
            </h1>
            <p className="mx-auto mt-6 max-w-md font-body text-xl font-light tracking-wide text-on-surface-variant md:text-2xl">
              A Arena de Elite do{" "}
              <span className="font-bold text-m3-secondary">FIFA</span>
            </p>
          </div>

          <div className="flex justify-center">
            <Link
              href={arenaHref}
              className="group relative w-full overflow-hidden rounded-xl bg-linear-to-r from-m3-primary to-primary-fixed px-16 py-6 font-headline text-xl font-bold tracking-tight text-on-primary-container shadow-[0_0_30px_rgba(133,173,255,0.4)] transition-all hover:shadow-[0_0_40px_rgba(133,173,255,0.6)] active:scale-95 md:w-auto"
            >
              <span className="relative z-10">
                {isLoggedIn ? "IR AO DASHBOARD" : "ENTRAR NA ARENA"}
              </span>
              <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="mx-auto flex max-w-4xl items-center justify-between border-t border-outline-variant/10 pt-6">
            <p className="font-label text-[10px] tracking-wider text-on-surface-variant/40">
              © 2026 NEXUS OVERDRIVE INTERACTIVE
            </p>
            <div className="flex gap-4 text-on-surface-variant/40">
              <MaterialSymbol name="language" className="text-sm" />
              <MaterialSymbol name="security" className="text-sm" />
            </div>
          </div>
        </div>

        <div
          className="pointer-events-none absolute left-1/4 top-1/4 size-96 rounded-full bg-m3-primary/5 blur-[120px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-1/4 right-1/4 size-64 rounded-full bg-tertiary-container/5 blur-[100px]"
          aria-hidden
        />
      </main>
    </div>
  );
}
