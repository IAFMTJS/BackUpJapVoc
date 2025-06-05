const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const BrotliPlugin = require('brotli-webpack-plugin');
const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity');
const express = require('express');

// Base configuration that can be extended by dev and prod configs
module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isVercel = process.env.VERCEL === '1';
  // const analyzeBundle = env.analyze === 'true';  // Comment out bundle analyzer flag

  return {
    mode: isProduction ? 'production' : 'development',
    entry: {
      main: './src/index.tsx'
    },
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: isProduction ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].js',
      chunkFilename: isProduction ? 'static/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js',
      publicPath: '/',
      clean: isProduction,
      crossOriginLoading: 'anonymous',
      assetModuleFilename: 'static/media/[name].[hash][ext][query]',
      environment: {
        arrowFunction: true,
        const: true,
        destructuring: true,
        dynamicImport: true,
        forOf: true,
        module: true
      },
      chunkLoadTimeout: isVercel ? 120000 : 30000, // 2 minutes on Vercel
      chunkLoadingGlobal: 'webpackChunkBackupJapVoc'
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                '@babel/preset-env',
                ['@babel/preset-react', { runtime: 'automatic' }],
                '@babel/preset-typescript'
              ]
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: false,
                url: {
                  filter: (url, resourcePath) => {
                    if (url.startsWith('@')) return true;
                    if (url.startsWith('../')) return true;
                    if (url.startsWith('/assets/')) {
                      return url.replace('/assets/', '../assets/');
                    }
                    return false;
                  }
                }
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    require('tailwindcss'),
                    require('autoprefixer'),
                    require('cssnano')({
                      preset: ['default', {
                        discardComments: { removeAll: true },
                        normalizeWhitespace: true,
                        minifyFontValues: true,
                        minifyGradients: true,
                        mergeLonghand: true,
                        mergeRules: true,
                        reduceIdents: false,
                        zindex: false
                      }]
                    })
                  ]
                }
              }
            }
          ]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 4 * 1024
            }
          },
          generator: {
            filename: 'static/media/[name].[hash][ext]'
          }
        },
        {
          test: /\.(mp3|wav|ogg)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'static/audio/[name][ext]',
            emit: false
          }
        },
        {
          test: /\.json$/,
          type: 'json',
        },
      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '~public': path.resolve(__dirname, 'public'),
        'process': 'process/browser.js',
        '@assets': path.resolve(__dirname, 'assets'),
        '/assets': path.resolve(__dirname, 'assets')
      },
      fallback: {
        "path": require.resolve("path-browserify"),
        "fs": false,
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer/"),
        "util": require.resolve("util/"),
        "assert": require.resolve("assert/"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "url": require.resolve("url/"),
        "zlib": require.resolve("browserify-zlib"),
        "async_hooks": false
      }
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction && !isVercel,
              drop_debugger: isProduction && !isVercel,
              pure_funcs: isProduction && !isVercel ? ['console.log', 'console.info'] : [],
              passes: 2,
              dead_code: isProduction,
              unused: isProduction,
              keep_fargs: true,
              keep_classnames: true,
              keep_fnames: true
            },
            format: {
              comments: !isProduction,
              beautify: false
            },
            mangle: {
              safari10: true,
              toplevel: isProduction,
              keep_fnames: true,
              keep_classnames: true
            },
            ecma: 2020,
            keep_classnames: true,
            keep_fnames: true
          },
          extractComments: false,
          parallel: true
        })
      ],
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: isVercel ? 15 : 25,
        minSize: 20000,
        maxSize: isVercel ? 150000 : 200000,
        cacheGroups: {
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: 'vendor.mui',
            chunks: 'all',
            priority: 40,
            enforce: true,
            reuseExistingChunk: true
          },
          critical: {
            test: /[\\/]src[\\/](components|pages|hooks|utils)[\\/]/,
            name: 'critical',
            chunks: 'initial',
            priority: 30,
            reuseExistingChunk: true
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              return `vendor.${packageName.replace('@', '')}`;
            },
            priority: 20,
            reuseExistingChunk: true
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true
          }
        }
      },
      moduleIds: 'deterministic',
      runtimeChunk: {
        name: 'runtime',
        minSize: 10000
      },
      removeAvailableModules: isProduction,
      removeEmptyChunks: isProduction,
      mergeDuplicateChunks: isProduction
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser.js',
        Buffer: ['buffer', 'Buffer']
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development')
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/assets',
            to: 'static/media',
            noErrorOnMissing: true,
            globOptions: {
              ignore: ['**/.DS_Store']
            }
          },
          {
            from: 'public/assets',
            to: 'static/media',
            noErrorOnMissing: true,
            globOptions: {
              ignore: ['**/.DS_Store']
            }
          },
          {
            from: 'public/sounds',
            to: 'static/sounds',
            noErrorOnMissing: true,
            globOptions: {
              ignore: ['**/.DS_Store']
            }
          },
          {
            from: 'public/dict',
            to: 'dict',
            noErrorOnMissing: true
          },
          {
            from: 'node_modules/kuromoji/dict',
            to: 'dict',
            noErrorOnMissing: true
          },
          {
            from: 'public',
            to: '.',
            globOptions: {
              ignore: ['**/.DS_Store', '**/dict/**', '**/assets/**', '**/index.html']
            }
          },
          { 
            from: 'src/data/romaji-data.json', 
            to: 'romaji-data.json',
            noErrorOnMissing: true
          },
          {
            from: 'public/service-worker.js',
            to: 'service-worker.js',
            noErrorOnMissing: true,
            toType: 'file',
            force: true,
            transform(content) {
              // Ensure we're working with a string
              const contentStr = Buffer.isBuffer(content) ? content.toString('utf-8') : 
                               typeof content === 'string' ? content : '';
              
              // Remove any problematic imports or dynamic imports
              return contentStr
                .replace(/import\s*\([^)]*\)/g, '')
                .replace(/import\s+.*?from\s+['"].*?['"]/g, '')
                .replace(/export\s+.*?{.*?}/gs, '')
                .replace(/export\s+default/g, '');
            }
          },
          {
            from: 'public/audio',
            to: 'static/audio',
            noErrorOnMissing: true,
            globOptions: {
              ignore: ['**/.DS_Store'],
              matchBase: true,
              dot: false
            },
            toType: 'file',
            force: true
          }
        ],
        options: {
          concurrency: 4
        }
      }),
      new HtmlWebpackPlugin({
        template: 'public/index.html',
        inject: 'body',
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
        preload: [
          {
            rel: 'preload',
            as: 'script',
            href: '/static/js/runtime.js',
            fetchpriority: 'high',
          },
          {
            rel: 'preload',
            as: 'script',
            href: '/static/js/vendor.react.js',
            fetchpriority: 'high',
          },
          {
            rel: 'preload',
            as: 'script',
            href: '/static/js/vendor.mui.js',
            fetchpriority: 'high',
          },
          {
            rel: 'preload',
            as: 'script',
            href: '/static/js/critical.js',
            fetchpriority: 'high',
          },
        ],
        prefetch: [
          {
            rel: 'prefetch',
            href: '/static/js/vendor.js'
          }
        ],
        preconnect: [
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com'
        ],
        chunks: ['runtime', 'vendor.react', 'vendor.mui', 'main'],
        chunksSortMode: 'manual',
        csp: isProduction ? {
          'default-src': "'self'",
          'script-src': "'self' 'unsafe-inline' 'unsafe-eval'",
          'style-src': "'self' 'unsafe-inline'",
          'img-src': "'self' data: https:",
          'connect-src': "'self' https:",
          'font-src': "'self'",
          'object-src': "'none'",
          'media-src': "'self'",
          'frame-src': "'none'"
        } : undefined
      }),
      ...(isProduction ? [
        new CompressionPlugin({
          test: /\.(js|css|html|svg|json)$/,
          algorithm: 'gzip',
          threshold: 10240,
          minRatio: 0.8,
          deleteOriginalAssets: false
        }),
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css'
        }),
        new BrotliPlugin({
          asset: '[path].br[query]',
          test: /\.(js|css|html|svg|json)$/,
          threshold: 10240,
          minRatio: 0.8,
          deleteOriginalAssets: false
        }),
        new SubresourceIntegrityPlugin({
          hashFuncNames: ['sha384']
        }),
        // Comment out BundleAnalyzerPlugin
        // analyzeBundle && new BundleAnalyzerPlugin({
        //   analyzerMode: 'server',
        //   analyzerPort: 8888,
        //   openAnalyzer: true,
        //   generateStatsFile: true,
        //   statsFilename: 'bundle-stats.json'
        // }),
      ] : []),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.optimize.AggressiveMergingPlugin(),
      new webpack.ids.HashedModuleIdsPlugin({
        context: __dirname,
        hashFunction: 'xxhash64',
        hashDigest: 'hex',
        hashDigestLength: 16
      }),
      new webpack.ProvidePlugin({
        React: 'react',
        'window.React': 'react'
      }),
    ],
    devServer: {
      static: [
        {
          directory: path.join(__dirname, 'public'),
          publicPath: '/',
          watch: true
        },
        {
          directory: path.join(__dirname, 'build'),
          publicPath: '/',
          watch: true
        }
      ],
      historyApiFallback: {
        disableDotRule: true,
        rewrites: [
          { from: /^\//, to: '/index.html' }
        ]
      },
      hot: true,
      liveReload: true,
      watchFiles: {
        paths: ['src/**/*', 'public/**/*'],
        options: {
          usePolling: false,
          interval: 100,
        },
      },
      port: 3002,
      allowedHosts: 'all',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      devMiddleware: {
        writeToDisk: false,
        publicPath: '/',
        stats: {
          colors: true,
          chunks: false,
          modules: false,
          children: false,
          reasons: false,
          errorDetails: true
        }
      },
      client: {
        overlay: {
          errors: true,
          warnings: false
        },
        progress: true,
        logging: 'error',
        reconnect: true,
        webSocketURL: {
          hostname: 'localhost',
          pathname: '/ws',
          port: 3002
        },
        webSocketTransport: 'ws'
      },
      compress: true,
      open: true,
      onListening: (devServer) => {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined');
        }
        const port = devServer.server.address().port;
        console.log('Listening on port:', port);
      },
      setupMiddlewares: (middlewares, devServer) => {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined');
        }
        
        // Simplified critical loading middleware
        middlewares.push({
          name: 'critical-loading',
          middleware: (req, res, next) => {
            if (req.path.endsWith('.js')) {
              res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
              res.setHeader('Pragma', 'no-cache');
              res.setHeader('Expires', '0');
            }
            next();
          }
        });

        // Simplified error handling middleware
        middlewares.push({
          name: 'error-handler',
          middleware: (err, req, res, next) => {
            console.error('Loading error:', err);
            if (err.name === 'AbortError' || 
                (err.message && err.message.includes('Loading chunk'))) {
              res.status(200).send(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Loading Error</title>
                    <script>
                      console.log('Resource loading failed, reloading...');
                      window.location.reload();
                    </script>
                  </head>
                  <body>
                    <p>Loading error, reloading page...</p>
                  </body>
                </html>
              `);
              return;
            }
            next(err);
          }
        });

        return middlewares;
      }
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    performance: {
      hints: isProduction ? (isVercel ? false : 'warning') : false, // Disable performance hints on Vercel
      maxEntrypointSize: isVercel ? 1024000 : 512000, // Double size limit for Vercel
      maxAssetSize: isVercel ? 1024000 : 512000
    },
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename]
      },
      cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/webpack'),
      compression: 'gzip',
      maxAge: 172800000 // 2 days
    },
    stats: {
      errorDetails: true,
      logging: 'verbose',
      loggingDebug: ['webpack', 'webpack-dev-server'],
      loggingTrace: true,
      children: true,
      modules: true,
      reasons: true,
      moduleTrace: true,
      errorStack: true
    }
  };
}; 