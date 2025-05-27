const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const BrotliPlugin = require('brotli-webpack-plugin');
const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const analyzeBundle = env.analyze === 'true';

  return {
    mode: isProduction ? 'production' : 'development',
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: isProduction ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].js',
      chunkFilename: isProduction ? 'static/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js',
      publicPath: '/',
      clean: true,
      crossOriginLoading: 'anonymous',
      assetModuleFilename: 'static/media/[name].[hash][ext][query]',
      chunkLoadingGlobal: 'webpackChunkBackupJapVoc',
      chunkLoadTimeout: 120000
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
              maxSize: 4 * 1024 // Reduced to 4kb for better performance
            }
          },
          generator: {
            filename: 'static/media/[name].[hash][ext]'
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
              pure_funcs: isProduction ? ['console.log'] : []
            },
            format: {
              comments: false
            },
            mangle: true
          },
          extractComments: false
        }),
        /* Temporarily commenting out image optimization
        new ImageMinimizerPlugin({
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: {
              plugins: [
                ['imagemin-mozjpeg', { quality: 60, progressive: true }],
                ['imagemin-pngquant', { quality: [0.6, 0.8], speed: 4 }],
                ['imagemin-gifsicle', { interlaced: true, optimizationLevel: 3 }],
              ]
            }
          }
        })
        */
      ],
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 10000,
        maxSize: 500000,
        cacheGroups: {
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: 'vendor.mui',
            chunks: 'all',
            priority: 30,
            enforce: false,
            reuseExistingChunk: true
          },
          vendor: {
            test: /[\\/]node_modules[\\/](?!@mui)[\\/]/,
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              return `vendor.${packageName.replace('@', '')}`;
            },
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          },
          styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true,
            priority: 30
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
              ignore: ['**/index.html', '**/.DS_Store', '**/dict/**', '**/assets/**']
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
            href: '/static/js/runtime-main.js'
          },
          {
            rel: 'preload',
            as: 'script',
            href: '/static/js/vendor.mui.js'
          },
          {
            rel: 'preload',
            as: 'script',
            href: '/static/js/vendor.kuromoji.js'
          }
        ],
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
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development')
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
        ...(analyzeBundle ? [new BundleAnalyzerPlugin()] : []),
      ] : [])
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
      hot: 'only',
      port: 3002,
      allowedHosts: 'all',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      devMiddleware: {
        writeToDisk: true,
        publicPath: '/'
      },
      client: {
        overlay: {
          errors: true,
          warnings: false
        },
        progress: true,
        logging: 'info',
        reconnect: true
      },
      compress: true,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          secure: false,
          changeOrigin: true
        }
      }
    },
    devtool: isProduction ? false : 'eval-source-map',
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    },
    stats: {
      errorDetails: true
    }
  };
}; 