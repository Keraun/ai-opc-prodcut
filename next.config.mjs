/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['localhost', '192.168.10.50','119.29.106.52'],
}

export default nextConfig
