/** @type {import('next').NextConfig} */
const nextConfig = {
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
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
};

export default nextConfig;
