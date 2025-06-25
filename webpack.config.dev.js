const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseConfig = require('./webpack.config.js');

module.exports = (env, argv) => {
  // Ensure we're in development mode
  const devEnv = { ...env, NODE_ENV: 'development' };
  const devArgv = { ...argv, mode: 'development' };
  
  // Get base config with development settings
  const base = baseConfig(devEnv, devArgv);
  
  // Development-specific overrides
  const devConfig = {
    mode: 'development',
    devtool: 'eval-source-map',
    optimization: {
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false, // Disable code splitting for faster builds
    },
    devServer: {
      port: 3002,
      host: '0.0.0.0', // Bind to all interfaces for incognito compatibility
      hot: true,
      open: false,
      historyApiFallback: true,
      static: {
        directory: path.join(__dirname, 'public'),
      },
      proxy: [
        {
          context: ['/api'],
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      ],
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
        webSocketURL: {
          hostname: 'localhost',
          pathname: '/ws',
          port: 3002,
        },
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
      allowedHosts: 'all', // Allow all hosts for incognito mode
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
      new webpack.HotModuleReplacementPlugin(),
    ],
  };
  
  // Merge base config with development overrides
  return merge(base, devConfig);
}; 