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
  
  // Override the optimization settings completely for development
  const devConfig = {
    mode: 'development',
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'static/js/[name].js',
      chunkFilename: 'static/js/[name].chunk.js',
      publicPath: '/',
      clean: false,
      crossOriginLoading: 'anonymous',
      assetModuleFilename: 'static/media/[name].[hash][ext][query]',
      chunkLoadingGlobal: 'webpackChunkBackupJapVoc',
      chunkLoadTimeout: 30000, // Reduced timeout for mobile
      globalObject: 'this',
      chunkLoading: 'jsonp',
      chunkFormat: 'array-push'
    },
    module: base.module,
    resolve: base.resolve,
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
    devtool: 'eval-source-map', // Better for debugging on mobile
    optimization: {
      removeAvailableModules: false,
      removeEmptyChunks: false,
      // Force code splitting for development to prevent large bundles
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 8, // Reduced for mobile
        minSize: 20000,
        maxSize: 200000, // Even smaller chunks for mobile
        cacheGroups: {
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: 'vendor.mui',
            chunks: 'all',
            priority: 30,
            enforce: true,
            reuseExistingChunk: true
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'vendor.react',
            chunks: 'all',
            priority: 25,
            enforce: true,
            reuseExistingChunk: true
          },
          firebase: {
            test: /[\\/]node_modules[\\/]@?firebase[\\/]/,
            name: 'vendor.firebase',
            chunks: 'all',
            priority: 20,
            enforce: true,
            reuseExistingChunk: true
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 10,
            enforce: true,
            reuseExistingChunk: true
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            enforce: true,
            reuseExistingChunk: true
          }
        }
      },
      runtimeChunk: 'single'
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser.js',
        Buffer: ['buffer', 'Buffer']
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development')
      }),
      new webpack.BannerPlugin({
        banner: 'window.webpackChunkBackupJapVoc = window.webpackChunkBackupJapVoc || [];',
        raw: true,
        entryOnly: true
      }),
      // Add chunk loading error handler for development
      {
        apply: (compiler) => {
          compiler.hooks.compilation.tap('ChunkLoadingErrorHandler', (compilation) => {
            compilation.hooks.afterOptimizeChunkModules.tap('ChunkLoadingErrorHandler', (chunks, modules) => {
              // Add chunk loading error handling
              compilation.mainTemplate.hooks.requireEnsure.tap('ChunkLoadingErrorHandler', (source, chunk, hash) => {
                return source.replace(
                  /__webpack_require__\.e\s*\(\s*([^)]+)\s*\)/g,
                  '__webpack_require__.e($1).catch(function(err) { console.error("Chunk loading failed:", err); return Promise.reject(err); })'
                );
              });
            });
          });
        }
      }
    ],
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename]
      }
    }
  };

  return devConfig;
}; 