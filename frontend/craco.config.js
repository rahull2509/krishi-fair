// craco.config.js
const path = require("path");
require("dotenv").config();

module.exports = {
  eslint: {
    configure: {
      extends: ["plugin:react-hooks/recommended"],
      rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    },
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {
      webpackConfig.watchOptions = {
        ...webpackConfig.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/build/**',
          '**/dist/**',
          '**/coverage/**',
          '**/public/**',
        ],
      };
      return webpackConfig;
    },
  },
  devServer: (devServerConfig) => {
    devServerConfig.proxy = {
      ...(devServerConfig.proxy || {}),
      "/api": {
        target: process.env.REACT_APP_BACKEND_URL || "http://localhost:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: process.env.REACT_APP_BACKEND_URL || "http://localhost:5000",
        changeOrigin: true,
      },
    };
    return devServerConfig;
  },
};
