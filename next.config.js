/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // This will ignore all errors during the build process
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.minimize = true;
    }
    return config;
  },
  // This will prevent Next.js from attempting to create pages for /rectangle and /scene
  // which seem to be components rather than actual pages
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    return {
      "/": { page: "/" },
      // add other pages here if needed
    };
  },
};

module.exports = nextConfig;
