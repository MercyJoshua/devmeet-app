import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Rewrites to proxy API requests to the backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*', // Proxy to Backend
      },
    ];
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Add Monaco Webpack Plugin for client-side
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ['javascript', 'typescript', 'html', 'css', 'json', 'markdown', 'sql'],
          filename: 'static/[name].worker.js', 
        })
      );
    }

    // Add rule to handle font files like codicon.ttf
    config.module.rules.push({
      test: /\.(ttf|woff|woff2|eot)$/,
      use: ['url-loader'],
      include: path.resolve(__dirname, 'node_modules/monaco-editor'),
    });

    return config;
  },
};

export default nextConfig;
