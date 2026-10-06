import type { NextConfig } from "next"

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number]

// Strapi media: allow the host from STRAPI_URL (e.g. https://api.yourstore.pk), plus local dev.
const strapiMedia = (): RemotePattern[] => {
  try {
    const url = new URL(process.env.STRAPI_URL ?? "")
    return [{ protocol: url.protocol.replace(":", "") as "http" | "https", hostname: url.hostname, port: url.port, pathname: "/uploads/**" }]
  } catch {
    return []
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...strapiMedia(),
      { protocol: "http", hostname: "localhost", port: "1337", pathname: "/uploads/**" },
    ],
    // Required in Next 16 to optimize images served from a local Strapi (localhost / private IPs).
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    qualities: [75, 90],
  },
}

export default nextConfig
