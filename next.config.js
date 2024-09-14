/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
  },
  // Performance optimizations
  optimizeFonts: true,
  compress: true,
  // Security settings
  poweredByHeader: false,
  // URL yapısını düzenleyelim
  async rewrites() {
    return [
      {
        source: '/title/:slug',
        destination: '/title/:slug?page=1',
      },
    ];
  },
  devIndicators: {
    buildActivity: false,
  },
}

module.exports = nextConfig