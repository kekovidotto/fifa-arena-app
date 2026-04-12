"use client";

import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Settings,
  Target,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/matches", label: "Partidas", icon: CalendarDays },
  { href: "/top-scorers", label: "Artilharia", icon: Target },
  { href: "/settings", label: "Config", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    toast.success("Sessão encerrada!");
    router.push("/authentication");
  }

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-white/5 bg-[#020617]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${
                active ? "text-neon-green" : "text-white/40 hover:text-white/60"
              }`}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-medium text-red-400/60 transition-colors hover:text-red-400"
        >
          <LogOut className="size-5" />
          Sair
        </button>
      </div>
    </nav>
  );
}
