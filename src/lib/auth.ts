import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db, drizzleSchema, isSqliteDatabaseUrl } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: isSqliteDatabaseUrl() ? "sqlite" : "pg",
    schema: drizzleSchema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      /**
       * Atualiza nome/foto do utilizador a cada login Google (a biblioteca
       * não repõe `image` em contas já existentes por defeito).
       */
      overrideUserInfoOnSignIn: true,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
});
