/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.minimize = true;
    }
    return config;
  },
  // Explicitly define which pages to generate
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    return {
      "/": { page: "/" },
      // Add other pages here if you have any
      // '/about': { page: '/about' },
      // '/contact': { page: '/contact' },
    };
  },
};

module.exports = nextConfig;
