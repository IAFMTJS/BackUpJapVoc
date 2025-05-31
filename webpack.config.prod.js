const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.config.js');
const fs = require('fs');

// Create a write stream for logging
const logStream = fs.createWriteStream('webpack-build.log', { flags: 'a' });

module.exports = (env, argv) => {
  // Ensure we're in production mode
  const prodEnv = { ...env, NODE_ENV: 'production' };
  const prodArgv = { ...argv, mode: 'production' };
  
  // Get base config with production settings
  const common = commonConfig(prodEnv, prodArgv);
  
  // Log the configuration
  logStream.write('Starting webpack build...\n');
  logStream.write('Environment: ' + JSON.stringify(prodEnv) + '\n');
  logStream.write('Arguments: ' + JSON.stringify(prodArgv) + '\n');
  
  // Only add production-specific overrides
  const config = merge(common, {
    devtool: 'source-map',
    stats: {
      logging: 'verbose',
      loggingDebug: ['webpack'],
      loggingTrace: true,
      errorDetails: true,
      children: true
    },
    plugins: [
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