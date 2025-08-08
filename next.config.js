/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep defaults so Vercel looks for .next in the project root
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  experimental: {
    // Ensure tracing is rooted at the project directory to avoid /path0/path0 duplication
    outputFileTracingRoot: process.cwd(),
  },
};

module.exports = nextConfig;
