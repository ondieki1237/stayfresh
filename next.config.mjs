/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static HTML export for Capacitor
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true, // Better for mobile apps
  // Disable features not supported in static export
  swcMinify: true,
}

export default nextConfig
