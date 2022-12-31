/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  distDir: "build",
  async redirects() {
    return [
      {
        source: "/",
        destination: "/plan",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
