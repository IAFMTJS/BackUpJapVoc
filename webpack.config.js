const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const BrotliPlugin = require('brotli-webpack-plugin');
const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity');
const express = require('express');

// Base configuration that can be extended by dev and prod configs
module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  // const analyzeBundle = env.analyze === 'true';  // Comment out bundle analyzer flag

  return {
    mode: isProduction ? 'production' : 'development',
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: isProduction ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].js',
      chunkFilename: isProduction ? 'static/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js',
      publicPath: '/',
      clean: isProduction,
      crossOriginLoading: 'anonymous',
      assetModuleFilename: 'static/media/[name].[hash][ext][query]',
      chunkLoadingGlobal: 'webpackChunkBackupJapVoc',
      chunkLoadTimeout: 120000,
      chunkLoading: 'jsonp',
      chunkFormat: 'array-push',
      hashFunction: 'xxhash64',
      hashDigest: 'hex',
      hashDigestLength: 16,
      environment: {
        arrowFunction: true,
        const: true,
        destructuring: true,
        dynamicImport: true,
        forOf: true,
        module: true
      }
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
            filename: 'static/sounds/[name][ext]'
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
              drop_console: isProduction,
              drop_debugger: isProduction,
              pure_funcs: isProduction ? ['console.log', 'console.info'] : [],
              passes: 2,
              dead_code: isProduction,
              unused: isProduction
            },
            format: {
              comments: !isProduction,
              beautify: false
            },
            mangle: {
              safari10: true,
              toplevel: isProduction,
              keep_fnames: !isProduction
            },
            ecma: 2020,
            keep_classnames: !isProduction,
            keep_fnames: !isProduction
          },
          extractComments: false,
          parallel: true
        })
      ],
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 30,
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          critical: {
            test: /[\\/]src[\\/](components|pages|hooks|utils)[\\/]/,
            name: 'critical',
            chunks: 'initial',
            priority: 60,
            reuseExistingChunk: true
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              return `vendor.${packageName.replace('@', '')}`;
            },
            priority: 50,
            reuseExistingChunk: true
          },
          audio: {
            test: /\.(mp3|wav|ogg)$/,
            name: 'audio',
            chunks: 'async',
            priority: 40,
            reuseExistingChunk: true
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 30,
            reuseExistingChunk: true
          }
        }
      },
      moduleIds: 'deterministic',
      runtimeChunk: 'single',
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
      new CopyPlugin({
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
          { from: 'src/data/romaji-data.json', to: 'romaji-data.json' }
        ]
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
          usePolling: true,
          interval: 1000,
        },
      },
      port: 3002,
      allowedHosts: 'all',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      devMiddleware: {
        writeToDisk: false,
        publicPath: '/'
      },
      client: {
        overlay: {
          errors: true,
          warnings: false
        },
        progress: true,
        logging: 'info',
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
        
        // Add critical loading middleware
        middlewares.push({
          name: 'critical-loading',
          middleware: (req, res, next) => {
            if (req.path.endsWith('.js')) {
              // Add priority hints for critical resources
              if (req.path.includes('runtime.js') || 
                  req.path.includes('vendor.react.js') || 
                  req.path.includes('vendor.mui.js') || 
                  req.path.includes('critical.js')) {
                res.setHeader('Priority', 'high');
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
              }
            }
            next();
          }
        });

        // Enhanced error handling middleware
        middlewares.push({
          name: 'error-handler',
          middleware: (err, req, res, next) => {
            console.error('Loading error:', err);
            
            // Handle critical loading failures
            if (err.name === 'AbortError' || 
                (err.message && (
                  err.message.includes('Loading chunk') || 
                  err.message.includes('Failed to load') ||
                  err.message.includes('NetworkError')
                ))) {
              
              // Check if it's a critical resource
              const isCritical = req.path.includes('runtime.js') || 
                               req.path.includes('vendor.react.js') || 
                               req.path.includes('vendor.mui.js') || 
                               req.path.includes('critical.js');
              
              if (isCritical) {
                // For critical resources, try immediate reload
                res.status(200).send(`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <title>Critical Resource Loading Error</title>
                      <script>
                        (function() {
                          console.log('Critical resource loading failed, attempting immediate recovery...');
                          
                          // Clear all caches immediately
                          if ('caches' in window) {
                            caches.keys().then(keys => {
                              keys.forEach(key => caches.delete(key));
                            });
                          }
                          
                          // Clear service worker
                          if ('serviceWorker' in navigator) {
                            navigator.serviceWorker.getRegistrations()
                              .then(registrations => {
                                registrations.forEach(reg => reg.unregister());
                              });
                          }
                          
                          // Force reload with cache busting
                          window.location.href = window.location.href.split('?')[0] + 
                            '?t=' + Date.now() + '&critical=' + Math.random();
                        })();
                      </script>
                    </head>
                    <body>
                      <p>Critical resource loading failed, recovering...</p>
                    </body>
                  </html>
                `);
                return;
              }
              
              // For non-critical resources, use the existing retry logic
              // ... existing error handling code ...
            }
            
            next(err);
          }
        });

        // Enhanced chunk recovery middleware
        middlewares.push({
          name: 'chunk-recovery',
          middleware: (req, res, next) => {
            // Add headers to prevent caching issues
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            
            // Add enhanced error recovery script to HTML responses
            if (req.path.endsWith('.html') || req.path === '/') {
              const originalSend = res.send;
              res.send = function(body) {
                if (typeof body === 'string' && body.includes('</head>')) {
                  const recoveryScript = `
                    <script>
                      (function() {
                        let retryCount = 0;
                        const maxRetries = 3;
                        
                        function handleChunkError(e) {
                          if (e.message && (e.message.includes('Loading chunk') || e.message.includes('AbortError'))) {
                            console.log('Detected chunk loading error, attempt:', retryCount + 1);
                            
                            if (retryCount < maxRetries) {
                              retryCount++;
                              // Clear the failed chunk from cache
                              if (window.webpackChunkBackupJapVoc) {
                                const chunkId = e.message.match(/Loading chunk (\\d+)/)?.[1];
                                if (chunkId) {
                                  delete window.webpackChunkBackupJapVoc[chunkId];
                                }
                              }
                              
                              // Retry loading after a delay
                              setTimeout(() => {
                                window.location.reload(true);
                              }, 1000 * retryCount);
                            } else {
                              // After max retries, do a full reload
                              console.log('Max retries reached, performing full reload');
                              window.location.href = window.location.href.split('?')[0] + '?t=' + Date.now();
                            }
                          }
                        }
                        
                        window.addEventListener('error', handleChunkError);
                        window.addEventListener('unhandledrejection', (e) => {
                          if (e.reason && e.reason.message) {
                            handleChunkError(e.reason);
                          }
                        });
                      })();
                    </script>
                  `;
                  body = body.replace('</head>', `${recoveryScript}</head>`);
                }
                return originalSend.call(this, body);
              };
            }
            next();
          }
        });

        return middlewares;
      }
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
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