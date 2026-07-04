import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Docker 部署：产出自包含的 standalone 服务
  output: "standalone",
};

export default nextConfig;
