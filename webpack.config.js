const path = require('path');
const webpack = require('webpack');
const WebpackObfuscator = require('webpack-obfuscator');
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
      crossOriginLoading: 'anonymous'
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
                    // Allow webpack aliases in CSS
                    if (url.startsWith('@') || url.startsWith('/')) {
                      return true;
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
                    require('autoprefixer')
                  ]
                }
              }
            }
          ]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024 // 8kb
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
        '@assets': path.resolve(__dirname, 'assets')
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
        "zlib": require.resolve("browserify-zlib")
      }
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction,
              drop_debugger: isProduction
            },
            format: {
              comments: false
            }
          },
          extractComments: false
        })
      ],
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              return `vendor.${packageName.replace('@', '')}`;
            },
          },
          kuromoji: {
            test: /[\\/]node_modules[\\/](kuromoji|kuroshiro)[\\/]/,
            name: 'vendor.kuromoji',
            priority: 10,
          },
          firebase: {
            test: /[\\/]node_modules[\\/]firebase[\\/]/,
            name: 'vendor.firebase',
            priority: 10,
          },
          recharts: {
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            name: 'vendor.recharts',
            priority: 10,
          }
        }
      }
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
      ...(isProduction ? [
        new CompressionPlugin({
          test: /\.(js|css|html|svg)$/,
          algorithm: 'gzip',
          threshold: 10240,
          minRatio: 0.8
        }),
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css'
        }),
        new BrotliPlugin({
          asset: '[path].br[query]',
          test: /\.(js|css|html|svg)$/,
          threshold: 10240,
          minRatio: 0.8
        }),
        new SubresourceIntegrityPlugin({
          hashFuncNames: ['sha384']
        }),
        new WebpackObfuscator({
          rotateStringArray: true,
          stringArray: true,
          stringArrayEncoding: ['base64'],
          stringArrayThreshold: 0.75
        }),
        ...(analyzeBundle ? [new BundleAnalyzerPlugin()] : []),
        new ImageMinimizerPlugin({
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: {
              plugins: [
                ['imagemin-mozjpeg', { quality: 65 }],
                ['imagemin-pngquant', { quality: [0.65, 0.90] }],
                ['imagemin-gifsicle', { interlaced: false }],
                ['imagemin-webp', { quality: 75 }]
              ]
            }
          }
        })
      ] : [])
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 3001,
      hot: true,
      historyApiFallback: true,
      proxy: [{
        context: ['/api'],
        target: 'http://localhost:3000',
        secure: false,
        changeOrigin: true,
        ws: true,
        onError: (err, req, res) => {
          console.error('Proxy error:', err);
          res.writeHead(500, {
            'Content-Type': 'text/plain',
          });
          res.end('Proxy error occurred. Please check the server logs.');
        },
        onProxyReq: (proxyReq, req, res) => {
          // Add request timeout
          proxyReq.setTimeout(5000);
        }
      }],
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      },
      client: {
        overlay: {
          errors: true,
          warnings: false
        },
        logging: 'error',
        progress: true
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