import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // Strapi media (local dev + production). Adjust hostnames when the backend is deployed.
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "1337", pathname: "/uploads/**" },
      { protocol: "https", hostname: "**.strapiapp.com" },
    ],
    // Required in Next 16 to optimize images served from a local Strapi (localhost / private IPs).
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    qualities: [75, 90],
  },
}

export default nextConfig
