import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empty turbopack config to silence the warning
  turbopack: {},
  
  // Enable standalone output for Docker
  output: "standalone",
  
  webpack: (config) => {
    // Fix for WalletConnect/RainbowKit dependencies
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      encoding: false,
    };
    
    // Externalize pino to prevent build errors
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    return config;
  },
  
  // Transpile specific packages
  transpilePackages: ["@rainbow-me/rainbowkit"],
};

export default nextConfig;
