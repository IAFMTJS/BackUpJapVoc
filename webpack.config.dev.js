const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.js');

module.exports = (env, argv) => {
  // Ensure we're in development mode
  const devEnv = { ...env, NODE_ENV: 'development' };
  const devArgv = { ...argv, mode: 'development' };
  
  // Get base config with development settings
  const base = baseConfig(devEnv, devArgv);
  
  // Only add development-specific overrides
  return merge(base, {
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
        serveIndex: true,
      },
      compress: true,
      port: 3002,
      hot: true,
      historyApiFallback: {
        disableDotRule: true,
        rewrites: [
          { from: /^\//, to: '/index.html' }
        ]
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      watchFiles: {
        paths: ['src/**/*', 'public/**/*'],
        options: {
          usePolling: false,
          ignored: /node_modules/
        }
      },
      proxy: [{
        context: ['/api'],
        target: 'http://localhost:3000',
        secure: false,
        changeOrigin: true
      }],
      client: {
        overlay: {
          errors: true,
          warnings: false
        },
        progress: false
      }
    },
    devtool: 'eval',
    optimization: {
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false,
    },
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename]
      }
    }
  });
}; 