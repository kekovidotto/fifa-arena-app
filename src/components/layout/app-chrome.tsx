"use client";

import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  emoji: string;
  match: (path: string) => boolean;
};

const publicNav: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    emoji: "🏠",
    match: (p) => p === "/dashboard",
  },
  {
    href: "/classificacao",
    label: "Classificação Geral",
    emoji: "📊",
    match: (p) => p === "/classificacao" || p === "/standings",
  },
  {
    href: "/artilheria",
    label: "Artilharia",
    emoji: "⚽",
    match: (p) => p === "/artilheria" || p === "/top-scorers",
  },
  {
    href: "/players",
    label: "Hall da Fama",
    emoji: "👥",
    match: (p) => p === "/players",
  },
];

function profileNav(userId: string): NavItem {
  return {
    href: `/profile/${userId}`,
    label: "Meu Perfil",
    emoji: "👤",
    match: (p) => p === `/profile/${userId}`,
  };
}

const adminNav: NavItem[] = [
  {
    href: "/register",
    label: "Registrar Jogadores/Torneio",
    emoji: "➕",
    match: (p) => p === "/register",
  },
  {
    href: "/settings",
    label: "Configurações / Zona de Perigo",
    emoji: "⚙️",
    match: (p) => p === "/settings",
  },
];

function NavLinkRow({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate: () => void;
}) {
  const active = item.match(pathname);
  return (
    <SheetClose asChild>
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-all",
          active
            ? "border-neon-green/50 bg-neon-green/10 text-white shadow-[0_0_20px_rgba(34,197,94,0.25)]"
            : "border-white/5 bg-white/[0.03] text-white/80 hover:border-white/15 hover:bg-white/[0.06]",
        )}
      >
        <span className="text-lg" aria-hidden>
          {item.emoji}
        </span>
        {item.label}
      </Link>
    </SheetClose>
  );
}

function LogoutNavButton({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      className={cn(
        "flex h-auto w-full items-center justify-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-all",
        "border-red-500/35 bg-red-500/10 text-red-100 hover:border-red-400/50 hover:bg-red-500/18",
      )}
      onClick={() => {
        onClose();
        startTransition(async () => {
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                router.push("/login");
                router.refresh();
              },
            },
          });
        });
      }}
    >
      <LogOut className="size-4 shrink-0 opacity-90" aria-hidden />
      Sair
    </Button>
  );
}

export function AppChrome({
  children,
  viewerIsAdmin,
  viewerUserId,
}: {
  children: React.ReactNode;
  viewerIsAdmin: boolean;
  viewerUserId: string | null;
}) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [open, setOpen] = useState(false);

  const isLoggedIn = Boolean(session?.user?.id ?? viewerUserId);
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/authentication";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (isAuthRoute) {
    return (
      <div className="flex min-h-dvh flex-col bg-[#020617]">{children}</div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-60 flex h-14 shrink-0 items-center border-b border-white/10 bg-[#020617]/80 px-2 backdrop-blur-xl">
          <div className="flex w-full items-center gap-2">
            <div className="w-12 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1 text-center">
              <span className="text-sm font-black tracking-widest text-white/90">
                FIFA ARENA
              </span>
            </div>
            <div className="flex w-[5.5rem] shrink-0 justify-end">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-white/20 bg-white/5 font-semibold text-white hover:bg-white/10"
              >
                <Link href="/login">Entrar</Link>
              </Button>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-60 flex h-14 shrink-0 items-center border-b border-white/10 bg-[#020617]/80 px-2 backdrop-blur-xl">
        <div className="flex w-full items-center gap-2">
          <div className="flex w-12 shrink-0 justify-start">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                  aria-label="Abrir menu"
                >
                  <Menu className="size-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                showCloseButton={false}
                className="w-[min(100vw,320px)] border-white/10 bg-[#070b14]/92 p-0 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#070b14]/85"
              >
                <SheetHeader className="border-b border-white/10 px-4 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <SheetTitle className="text-left text-base font-black tracking-wider text-white">
                      FIFA ARENA
                    </SheetTitle>
                    <SheetClose asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0 text-white/70 hover:bg-white/10 hover:text-white"
                        aria-label="Fechar menu"
                      >
                        <X className="size-5" />
                      </Button>
                    </SheetClose>
                  </div>
                  <p className="text-left text-xs text-muted-foreground">
                    Navegação rápida
                  </p>
                </SheetHeader>

                <nav className="flex flex-col gap-2 overflow-y-auto p-4 pb-8">
                  <p className="mb-1 text-[10px] font-bold tracking-widest text-neon-blue/90">
                    GERAL
                  </p>
                  {publicNav.map((item) => (
                    <NavLinkRow
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      onNavigate={() => setOpen(false)}
                    />
                  ))}

                  {viewerUserId && (
                    <>
                      <p className="mb-1 mt-4 text-[10px] font-bold tracking-widest text-muted-foreground">
                        CONTA
                      </p>
                      <NavLinkRow
                        item={profileNav(viewerUserId)}
                        pathname={pathname}
                        onNavigate={() => setOpen(false)}
                      />
                      <LogoutNavButton onClose={() => setOpen(false)} />
                    </>
                  )}

                  {viewerIsAdmin && (
                    <>
                      <p className="mb-1 mt-4 text-[10px] font-bold tracking-widest text-amber-400/90">
                        ÁREA DO ADMIN
                      </p>
                      {adminNav.map((item) => (
                        <NavLinkRow
                          key={item.href}
                          item={item}
                          pathname={pathname}
                          onNavigate={() => setOpen(false)}
                        />
                      ))}
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <div className="min-w-0 flex-1 text-center">
            <Link
              href="/dashboard"
              className="text-sm font-black tracking-widest text-white/90"
            >
              FIFA ARENA
            </Link>
          </div>

          <div className="w-12 shrink-0" aria-hidden />
        </div>
      </header>

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
