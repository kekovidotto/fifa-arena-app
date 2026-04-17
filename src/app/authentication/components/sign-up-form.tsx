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

const registerSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
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

const STADIUM_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDTtt6txCaXMlsdorMAdbKli2L091Gd6O2gjNZbUbxt5VWwiJknS2qJiVQJUk3Q5KBbcXYFzWjHbrrjJRNvOa3kXRepTf26De8Wh4olk2CQc208VIcZNOI6Q4OlKhlfN5TKcVzAyZ0QP3oJZbQrxpjvli9zwT5C2sBv_sPkvOvuSAbVqR2hFB235Pji5ZRKONKIaC1heYujKPb05zS-XyL6-7RaNcdiXxvJDwPBkn689KbUU9hQrGVd7rUaXe8bfAe_uV_2qR1VZZs";

const GOOGLE_MARK =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCeWQp2OLm0MzGRoA2_cNMKGPPqQkG3PXi0TSP_49gqcqTkgDRL5oUIRWRjBr1FBEgPER2Rjya4Zfi49ops5qIt7SdC18jeNRPzhZTVmUw-zIrgmTyj9ArGaWq1N6hiXcFRB6RwbLAchy2nnB21AsLlpX-um7sMYxl46bUj-E1_65B3XblY75bMLAhngXzx33_Qd1Bp1rZXz8Iums3k5vWfdwgZIaxYJ0F8IZ805LBJv-XvR2k2oLByEqcjzzNLR08rhk-kXteQqFQ";

const APPLE_MARK =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA-MUEaB2FMehlP498LWxN9XahBllM1bZ6T2ErDH1lQLIpj1DXY3DWRLlc1PRPkbwzl3ntZdWa78NsAUu08YHIcf65coqCJ5eq6uJl6bUsvAJu818bYiC_rBS43FI2J7c9ILa_jxAKUnqyQ7dezTvJtwap_ro8yRMY201xh_d5Kn6lzs2OSk_39PQsWcqZ1QIg_kKNfQXoqxOyhVdQy4LyObZk82kzv3xM39OYv1MYoegy9-_iuTG10PX7j6zbcIT7js5uQUFx9Mgk";

function MaterialIcon({ name, className, filled }: { name: string; className?: string; filled?: boolean }) {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      style={filled ? { fontVariationSettings: "'FILL' 1, 'wght' 400" } : undefined}
      aria-hidden
    >
      {name}
    </span>
  );
}

function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    await authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.name,
      },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
        onError: (ctx) => {
          if (ctx.error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
            toast.error("Email já cadastrado");
            return;
          }
          toast.error("Erro ao criar conta");
        },
      },
    );
  }

  const handleGoogleSignUp = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  const disableSubmit = form.formState.isSubmitting || !acceptedTerms;

  return (
    <div className="relative z-10 w-full max-w-md">
      <div className="pointer-events-none absolute top-1/4 -right-20 size-96 rounded-full bg-m3-primary/10 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute bottom-1/4 -left-20 size-80 rounded-full bg-tertiary/5 blur-[100px]" aria-hidden />

      <div className="relative mb-10 text-center">
        <div className="relative mb-6 inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={STADIUM_IMG}
            alt=""
            className="size-24 rounded-full border-2 border-m3-primary/30 object-cover shadow-[0_0_30px_rgba(133,173,255,0.2)]"
          />
          <div className="absolute -bottom-2 -right-2 rounded-full bg-m3-secondary p-1.5 shadow-lg">
            <MaterialIcon name="verified" className="text-lg text-on-secondary" filled />
          </div>
        </div>
        <h2 className="mb-2 font-headline text-4xl font-bold uppercase tracking-tight text-on-surface">
          FIFA ARENA
        </h2>
        <p className="font-label text-sm uppercase tracking-wide text-on-surface-variant">
          Crie sua identidade de elite
        </p>
      </div>

      <div className="arena-glass-card rounded-xl border border-outline-variant/15 p-8 shadow-2xl">
        <form id="register-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="space-y-2">
                <label
                  htmlFor="register-name"
                  className="ml-1 block font-label text-[10px] font-extrabold uppercase tracking-[0.2em] text-m3-primary"
                >
                  Nome completo
                </label>
                <div className="group relative">
                  <MaterialIcon
                    name="person"
                    className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-xl text-on-surface-variant group-focus-within:text-m3-primary"
                  />
                  <Input
                    {...field}
                    id="register-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Ex: Gabriel Santos"
                    aria-invalid={fieldState.invalid}
                    className={cn(
                      "h-auto rounded-t-lg border-0 border-b-2 border-outline-variant bg-surface-container-low py-4 pl-12 font-headline text-sm uppercase tracking-wide shadow-none placeholder:text-on-surface-variant/30 focus-visible:border-m3-primary focus-visible:ring-0 dark:bg-surface-container-low",
                      fieldState.invalid && "border-m3-error",
                    )}
                  />
                </div>
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="space-y-2">
                <label
                  htmlFor="register-email"
                  className="ml-1 block font-label text-[10px] font-extrabold uppercase tracking-[0.2em] text-m3-primary"
                >
                  Email de acesso
                </label>
                <div className="group relative">
                  <MaterialIcon
                    name="alternate_email"
                    className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-xl text-on-surface-variant group-focus-within:text-m3-primary"
                  />
                  <Input
                    {...field}
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    placeholder="nexus@arena.gg"
                    aria-invalid={fieldState.invalid}
                    className={cn(
                      "h-auto rounded-t-lg border-0 border-b-2 border-outline-variant bg-surface-container-low py-4 pl-12 font-body text-sm tracking-wide shadow-none placeholder:text-on-surface-variant/30 focus-visible:border-m3-primary focus-visible:ring-0 dark:bg-surface-container-low",
                      fieldState.invalid && "border-m3-error",
                    )}
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
                <label
                  htmlFor="register-password"
                  className="ml-1 block font-label text-[10px] font-extrabold uppercase tracking-[0.2em] text-m3-primary"
                >
                  Criptografia de senha
                </label>
                <div className="group relative">
                  <MaterialIcon
                    name="lock"
                    className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-xl text-on-surface-variant group-focus-within:text-m3-primary"
                  />
                  <Input
                    {...field}
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••••••"
                    aria-invalid={fieldState.invalid}
                    className={cn(
                      "h-auto rounded-t-lg border-0 border-b-2 border-outline-variant bg-surface-container-low py-4 pl-12 pr-12 font-body text-sm shadow-none placeholder:text-on-surface-variant/30 focus-visible:border-m3-primary focus-visible:ring-0 dark:bg-surface-container-low",
                      fieldState.invalid && "border-m3-error",
                    )}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-on-surface"
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

          <div className="flex items-start gap-3 px-1 pt-2">
            <div className="pt-0.5">
              <input
                id="register-terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="size-4 rounded border-outline-variant bg-surface-container text-m3-primary focus:ring-m3-primary focus:ring-offset-surface"
              />
            </div>
            <label htmlFor="register-terms" className="font-label text-xs leading-relaxed text-on-surface-variant">
              Eu aceito os <span className="font-bold text-m3-primary">Termos de Combate</span> e a{" "}
              <span className="font-bold text-m3-primary">Privacidade de Dados</span> do Nexus Overdrive.
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={disableSubmit}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-tertiary-container py-5 font-headline text-lg font-extrabold uppercase tracking-widest text-on-tertiary-container shadow-[0_0_20px_rgba(0,241,254,0.3)] transition-all hover:shadow-[0_0_35px_rgba(0,241,254,0.5)] active:scale-[0.98] disabled:opacity-40"
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <>
                  Criar conta
                  <MaterialIcon name="bolt" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-10">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-linear-to-r from-transparent to-outline-variant/30" />
            <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Sincronizar com
            </span>
            <div className="h-px flex-1 bg-linear-to-l from-transparent to-outline-variant/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant/10 bg-surface-container-highest px-4 py-3 transition-colors hover:bg-surface-bright"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={GOOGLE_MARK} alt="" className="size-5" />
              <span className="font-label text-xs font-bold uppercase">Google</span>
            </button>
            <button
              type="button"
              disabled
              className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant/10 bg-surface-container-highest px-4 py-3 opacity-50"
              aria-disabled
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={APPLE_MARK} alt="" className="size-5 invert" />
              <span className="font-label text-xs font-bold uppercase">Apple</span>
            </button>
          </div>
        </div>
      </div>

      <p className="mt-8 text-center font-label text-sm text-on-surface-variant">
        Já faz parte da elite?
        <Link href="/login" className="ml-1 font-bold text-m3-primary hover:underline">
          Inicie sessão
        </Link>
      </p>
    </div>
  );
}

export default SignUpForm;
