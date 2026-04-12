"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { AdminGuard } from "@/components/admin-guard";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  materialIcon: string;
  match: (path: string) => boolean;
};

const generalNav: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    materialIcon: "dashboard",
    match: (p) => p === "/dashboard",
  },
  {
    href: "/matches",
    label: "Partidas",
    materialIcon: "calendar_month",
    match: (p) => p === "/matches",
  },
  {
    href: "/classificacao",
    label: "Classificação Geral",
    materialIcon: "leaderboard",
    match: (p) => p === "/classificacao" || p === "/standings",
  },
  {
    href: "/artilheria",
    label: "Artilharia",
    materialIcon: "sports_soccer",
    match: (p) => p === "/artilheria" || p === "/top-scorers",
  },
  {
    href: "/players",
    label: "Hall da Fama",
    materialIcon: "workspace_premium",
    match: (p) => p === "/players",
  },
];

function profileNavItem(userId: string): NavItem {
  return {
    href: `/profile/${userId}`,
    label: "Meu Perfil",
    materialIcon: "person",
    match: (p) => p === `/profile/${userId}`,
  };
}

const adminNav: NavItem[] = [
  {
    href: "/register",
    label: "Registrar Jogadores",
    materialIcon: "group_add",
    match: (p) => p === "/register",
  },
  {
    href: "/settings",
    label: "Configurações / Zona de Perigo",
    materialIcon: "settings_suggest",
    match: (p) => p === "/settings",
  },
];

function MaterialSymbol({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn("select-none", className, "material-symbols-outlined")}
      aria-hidden
    >
      {name}
    </span>
  );
}

function SidebarNavLink({
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
          "flex items-center gap-4 rounded-xl px-4 py-3 font-headline text-sm font-medium uppercase tracking-wider transition-all",
          active
            ? "active-nav-glow border-l-4 border-m3-primary bg-linear-to-r from-m3-primary/20 to-transparent text-m3-primary"
            : "border-l-4 border-transparent bg-surface-container text-on-surface/70 hover:border-m3-primary hover:text-m3-primary",
        )}
      >
        <MaterialSymbol name={item.materialIcon} className="text-[22px]" />
        <span className="truncate">{item.label}</span>
      </Link>
    </SheetClose>
  );
}

function NavSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 px-4 font-label text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
      {children}
    </h3>
  );
}

function LogoutFooterButton({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className={cn(
        "flex w-full items-center justify-center gap-3 rounded-xl border border-m3-error/30 bg-m3-error/10 py-3.5 font-headline text-sm font-bold uppercase tracking-wider text-m3-error transition-colors",
        "hover:border-m3-error/50 hover:bg-m3-error/16 active:scale-[0.99] disabled:opacity-50",
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
      <MaterialSymbol name="logout" className="text-[22px] text-m3-error" />
      Sair
    </button>
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

  const user = session?.user;
  const userId = user?.id ?? viewerUserId ?? null;
  const displayName =
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    "Jogador";
  const email = user?.email ?? "";
  const image = user?.image;

  const isLoggedIn = Boolean(userId);
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
        <header className="sticky top-0 z-60 flex h-16 shrink-0 items-center border-b border-outline-variant/10 bg-m3-background px-4 shadow-[0_0_12px_rgba(133,173,255,0.1)]">
          <div className="flex w-full items-center gap-2">
            <div className="w-12 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1 text-center">
              <span className="font-headline text-sm font-bold tracking-tight text-m3-primary">
                FIFA ARENA
              </span>
            </div>
            <div className="flex w-22 shrink-0 justify-end">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-outline-variant/30 bg-surface-container text-on-surface hover:bg-surface-container-high"
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
      <header className="sticky top-0 z-60 flex h-16 shrink-0 items-center justify-between border-b border-outline-variant/10 bg-m3-background px-4 shadow-[0_0_12px_rgba(133,173,255,0.1)]">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="rounded-lg p-2 text-m3-primary transition-colors hover:bg-surface-container-highest active:scale-95"
                aria-label="Abrir menu"
              >
                <MaterialSymbol name="menu" className="text-[26px]" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              showCloseButton={false}
              className={cn(
                "h-full w-[80vw] max-w-[20rem] gap-0 border-r border-outline-variant/15 bg-m3-background p-0 sm:max-w-none sm:w-72",
                "rounded-none rounded-r-2xl shadow-[20px_0px_40px_rgba(8,14,28,0.5)]",
              )}
            >
              <SheetTitle className="sr-only">Menu de navegação FIFA Arena</SheetTitle>
              <div className="flex h-full flex-col overflow-hidden">
                <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-5">
                  <span className="font-headline text-lg font-bold tracking-tight text-m3-primary">
                    FIFA ARENA
                  </span>
                  <SheetClose asChild>
                    <button
                      type="button"
                      className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                      aria-label="Fechar menu"
                    >
                      <MaterialSymbol name="close" className="text-[22px]" />
                    </button>
                  </SheetClose>
                </div>

                <div className="shrink-0 border-b border-outline-variant/15 px-5 pb-6 pt-2">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <div
                        className="pointer-events-none absolute inset-0 rounded-2xl bg-m3-primary/20 blur-xl"
                        aria-hidden
                      />
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="relative size-16 rounded-2xl border border-m3-primary/30 object-cover"
                        />
                      ) : (
                        <div className="relative flex size-16 items-center justify-center rounded-2xl border border-m3-primary/30 bg-surface-container-highest font-headline text-lg font-bold text-m3-primary">
                          {displayName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="truncate font-headline text-base font-bold uppercase tracking-tight text-m3-primary">
                        {displayName}
                      </p>
                      {email ? (
                        <p className="mt-1 truncate font-body text-xs text-on-surface-variant">
                          {email}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <nav className="min-h-0 flex-1 space-y-8 overflow-y-auto px-3 py-6">
                  <div>
                    <NavSectionTitle>Geral</NavSectionTitle>
                    <div className="space-y-1.5">
                      {generalNav.map((item) => (
                        <SidebarNavLink
                          key={item.href}
                          item={item}
                          pathname={pathname}
                          onNavigate={() => setOpen(false)}
                        />
                      ))}
                    </div>
                  </div>

                  {userId ? (
                    <div>
                      <NavSectionTitle>Conta</NavSectionTitle>
                      <div className="space-y-1.5">
                        <SidebarNavLink
                          item={profileNavItem(userId)}
                          pathname={pathname}
                          onNavigate={() => setOpen(false)}
                        />
                      </div>
                    </div>
                  ) : null}

                  {viewerIsAdmin ? (
                    <AdminGuard fallback={null} compactPending>
                      <div>
                        <NavSectionTitle>Área do admin</NavSectionTitle>
                        <div className="space-y-1.5">
                          {adminNav.map((item) => (
                            <SidebarNavLink
                              key={item.href}
                              item={item}
                              pathname={pathname}
                              onNavigate={() => setOpen(false)}
                            />
                          ))}
                        </div>
                      </div>
                    </AdminGuard>
                  ) : null}
                </nav>

                <div className="shrink-0 border-t border-outline-variant/10 p-5">
                  <LogoutFooterButton onClose={() => setOpen(false)} />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link
            href="/dashboard"
            className="truncate font-headline text-base font-bold tracking-tight text-m3-primary"
          >
            FIFA ARENA
          </Link>
        </div>

        <div className="shrink-0 pl-2">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              referrerPolicy="no-referrer"
              className="size-10 rounded-full border-2 border-m3-primary/20 object-cover p-0.5"
            />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-full border-2 border-m3-primary/20 bg-surface-container-highest font-headline text-sm font-bold text-m3-primary">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
