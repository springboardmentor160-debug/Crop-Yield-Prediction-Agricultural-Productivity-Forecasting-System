import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use standalone output for Docker builds.
  // Vercel deployment handles serverless functions automatically; setting 'standalone' on Vercel causes '__dirname is not defined' errors.
  ...(process.env.DOCKER_BUILD === "true" ? { output: "standalone" } : {}),
};

export default nextConfig;
