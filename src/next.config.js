const { NextConfig } = require('next');
const config = require("./consts/config");

const nextConfig = {
  reactStrictMode: false,
  eslint: {
    dirs: ['components', 'consts', 'features', 'interfaces', 'pages', 'utils' ],
  },
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, net: false, os: false, tls: false, fs: false };
    return config;
  },
  basePath: config.basePath,
};

module.exports = nextConfig;
