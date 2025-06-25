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
      // Enable code splitting for development to prevent large bundles
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 10,
        minSize: 20000,
        maxSize: 244000, // Smaller chunks for mobile
        cacheGroups: {
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: 'vendor.mui',
            chunks: 'all',
            priority: 30,
            enforce: false,
            reuseExistingChunk: true
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'vendor.react',
            chunks: 'all',
            priority: 25,
            reuseExistingChunk: true
          },
          firebase: {
            test: /[\\/]node_modules[\\/]@?firebase[\\/]/,
            name: 'vendor.firebase',
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      },
      runtimeChunk: 'single'
    },
    output: {
      ...base.output,
      chunkLoadingGlobal: 'webpackChunkBackupJapVoc',
      chunkLoadTimeout: 30000, // Reduced timeout for mobile
      chunkLoading: 'jsonp',
      chunkFormat: 'array-push'
    },
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename]
      }
    }
  });
}; 