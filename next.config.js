/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['llamaindex', 'onnxruntime-node']
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark packages as external to prevent bundling
      config.externals.push('llamaindex', 'onnxruntime-node')
    }
    return config
  }
}

module.exports = nextConfig
