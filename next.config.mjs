/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "ap.rdcpix.com" },
      { protocol: "https", hostname: "**.rdcpix.com" },
    ],
  },
  // mapbox-gl requires transpiling
  transpilePackages: ["mapbox-gl"],
  // Prisma and pg must not be bundled by webpack — they use Node.js native modules
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
};

export default nextConfig;
