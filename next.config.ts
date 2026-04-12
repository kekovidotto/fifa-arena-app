import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Expõe ADMIN_EMAIL no cliente para AdminGuard alinhar com isAdmin() no servidor
  env: {
    NEXT_PUBLIC_ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "",
  },
};

export default nextConfig;
