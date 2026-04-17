"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email é obrigatório" })
    .email({ message: "Email inválido" }),
  password: z
    .string()
    .trim()
    .min(8, { message: "Senha deve ter pelo menos 8 caracteres" }),
});

function MaterialIcon({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("material-symbols-outlined select-none", className)} aria-hidden>
      {name}
    </span>
  );
}

function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
        onError: () => {
          toast.error("Email ou senha inválidos");
        },
      },
    );
  }

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low/60 p-8 shadow-[0px_20px_40px_rgba(133,173,255,0.08)] backdrop-blur-2xl">
      <div className="mb-10 text-center">
        <p className="mb-2 font-label text-[10px] font-extrabold uppercase tracking-[0.2em] text-m3-secondary">
          Autenticação de elite
        </p>
        <h2 className="font-headline text-4xl font-bold tracking-tight text-on-surface">ARENA FIFA</h2>
      </div>

      <form
        id="login-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-2">
              <label
                htmlFor="login-email"
                className="ml-1 font-label text-[11px] font-bold uppercase tracking-widest text-on-surface-variant"
              >
                E-mail do Piloto
              </label>
              <div
                className={cn(
                  "group relative rounded-lg border border-outline-variant/30 bg-surface-container-highest/50 transition-all duration-300 focus-within:border-m3-primary focus-within:shadow-[0_0_15px_rgba(133,173,255,0.4)]",
                  fieldState.invalid && "border-m3-error/60",
                )}
              >
                <MaterialIcon
                  name="alternate_email"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-m3-primary"
                />
                <Input
                  {...field}
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="nexus@nexus.com"
                  aria-invalid={fieldState.invalid}
                  className="h-auto border-0 bg-transparent py-4 pl-12 pr-4 text-sm text-on-surface shadow-none placeholder:text-outline-variant/50 focus-visible:ring-0 dark:bg-transparent"
                />
              </div>
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label
                  htmlFor="login-password"
                  className="font-label text-[11px] font-bold uppercase tracking-widest text-on-surface-variant"
                >
                  Código de Acesso
                </label>
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/50">
                  Esqueci a senha
                </span>
              </div>
              <div
                className={cn(
                  "group relative rounded-lg border border-outline-variant/30 bg-surface-container-highest/50 transition-all duration-300 focus-within:border-m3-primary focus-within:shadow-[0_0_15px_rgba(133,173,255,0.4)]",
                  fieldState.invalid && "border-m3-error/60",
                )}
              >
                <MaterialIcon
                  name="lock"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-m3-primary"
                />
                <Input
                  {...field}
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={fieldState.invalid}
                  className="h-auto border-0 bg-transparent py-4 pl-12 pr-12 text-sm text-on-surface shadow-none placeholder:text-outline-variant/50 focus-visible:ring-0 dark:bg-transparent"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant transition-colors hover:text-on-surface"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  <MaterialIcon name={showPassword ? "visibility_off" : "visibility"} />
                </button>
              </div>
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="flex w-full items-center justify-center space-x-2 rounded-lg bg-emerald-500 py-4 font-headline text-sm font-bold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-200 hover:bg-emerald-600 hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-[0.98] disabled:opacity-60"
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              <span>Iniciar sessão</span>
              <MaterialIcon name="bolt" className="text-lg" />
            </>
          )}
        </button>
      </form>

      <div className="my-8 flex items-center">
        <div className="h-px grow bg-outline-variant/20" />
        <span className="px-4 font-label text-[10px] uppercase tracking-widest text-outline-variant">
          Ou conectar com
        </span>
        <div className="h-px grow bg-outline-variant/20" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="group flex w-full items-center justify-center space-x-3 rounded-lg border border-outline-variant/30 bg-surface-container-highest py-3.5 font-label text-sm font-bold text-on-surface transition-all duration-200 hover:bg-surface-bright"
      >
        <svg className="size-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span className="text-xs font-bold uppercase tracking-widest">Google Neural Link</span>
      </button>

      <p className="mt-10 text-center font-label text-[11px] tracking-wide text-on-surface-variant">
        Novo no protocolo?
        <Link href="/login?tab=register" className="ml-1 font-bold text-m3-primary hover:underline">
          Criar nova conta
        </Link>
      </p>
    </div>
  );
}

export default LoginForm;
