/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
      if (!isServer) {
          config.externals = config.externals || [];
          config.externals.push("sharp");
      }
      return config;
  },
  experimental: {
      esmExternals: "loose",
  },
};

export default nextConfig;