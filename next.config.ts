import type { NextConfig } from "next";
const nextConfig: NextConfig = { output: "export", images: { unoptimized: true }, poweredByHeader: false, experimental: { cpus: 1 } };
export default nextConfig;
