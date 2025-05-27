const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.config.js');
const fs = require('fs');

// Create a write stream for logging
const logStream = fs.createWriteStream('webpack-build.log', { flags: 'a' });

module.exports = (env, argv) => {
  const common = commonConfig(env, argv);
  
  // Log the configuration
  logStream.write('Starting webpack build...\n');
  logStream.write('Environment: ' + JSON.stringify(env) + '\n');
  logStream.write('Arguments: ' + JSON.stringify(argv) + '\n');
  
  const config = merge(common, {
    mode: 'production',
    devtool: 'source-map',
    stats: {
      logging: 'verbose',
      loggingDebug: ['webpack'],
      loggingTrace: true,
      errorDetails: true,
      children: true
    },
    resolve: {
      ...common.resolve,
      fallback: {
        ...common.resolve?.fallback,
        "async_hooks": false,
        "path": require.resolve("path-browserify")
      }
    },
    optimization: {
      ...common.optimization,
      minimize: true
    },
    plugins: [
      ...common.plugins,
      {
        apply: (compiler) => {
          compiler.hooks.done.tap('LogPlugin', (stats) => {
            logStream.write('Build completed with stats:\n');
            logStream.write(stats.toString({
              chunks: true,
              modules: true,
              reasons: true,
              moduleTrace: true,
              errorDetails: true
            }) + '\n');
          });
          
          compiler.hooks.failed.tap('LogPlugin', (error) => {
            logStream.write('Build failed with error:\n');
            logStream.write(error.toString() + '\n');
          });
        }
      }
    ]
  });
  
  logStream.write('Final webpack configuration:\n');
  logStream.write(JSON.stringify(config, null, 2) + '\n');
  
  return config;
}; 