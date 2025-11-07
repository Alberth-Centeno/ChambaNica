import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
 // reactCompiler: true,
 images: {
    domains: ["res.cloudinary.com"], // 👈 agrega esto
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
