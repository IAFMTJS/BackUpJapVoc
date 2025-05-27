const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.js');

module.exports = (env, argv) => {
  const devConfig = {
    mode: 'development',
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'build'),
      publicPath: '/',
      filename: 'static/js/[name].js',
      chunkFilename: 'static/js/[name].chunk.js',
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
        publicPath: '/',
        watch: true
      },
      historyApiFallback: true,
      hot: true,
      port: 3002,
      allowedHosts: 'all',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      devMiddleware: {
        publicPath: '/',
        stats: 'verbose'
      },
      client: {
        overlay: {
          errors: true,
          warnings: true
        },
        progress: true,
        logging: 'verbose',
        reconnect: true
      },
      compress: true,
      open: true,
      proxy: [{
        context: ['/api'],
        target: 'http://localhost:3000',
        secure: false,
        changeOrigin: true,
        timeout: 60000
      }],
      watchFiles: {
        paths: ['src/**/*'],
        options: {
          ignored: /node_modules/
        }
      }
    },
    devtool: 'eval-source-map',
    resolve: {
      ...baseConfig(env, argv).resolve,
      fallback: {
        ...baseConfig(env, argv).resolve.fallback,
        "async_hooks": false,
        "path": require.resolve("path-browserify")
      }
    }
  };

  // Merge with base config
  return merge(baseConfig(env, argv), devConfig);
}; 