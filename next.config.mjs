/** @type {import('next').NextConfig} */
const isExport = process.env.EXPORT === 'true'

const nextConfig = {
  ...(isExport ? {
    output: 'export',
    basePath: '/ZHYTO',
    trailingSlash: true,
  } : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
