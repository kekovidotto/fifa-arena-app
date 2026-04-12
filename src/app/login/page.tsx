import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";

import LoginForm from "../authentication/components/login-form";
import SignUpForm from "../authentication/components/sign-up-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user) {
    redirect("/dashboard");
  }

  const { tab } = await searchParams;
  const defaultTab = tab === "register" ? "register" : "login";

  return (
    <div className="flex min-h-dvh w-full flex-1 items-center justify-center bg-[#020617] px-4 py-8">
      <Tabs
        key={defaultTab}
        defaultValue={defaultTab}
        className="w-full max-w-[400px]"
      >
        <TabsList>
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Criar conta</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm />
        </TabsContent>
        <TabsContent value="register">
          <SignUpForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
