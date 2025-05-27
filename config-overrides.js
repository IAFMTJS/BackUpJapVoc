module.exports = function override(config, env) {
  // Add fallback for path module
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "path": require.resolve("path-browserify")
  };

  // Add fallback for async_hooks
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "async_hooks": false
  };

  return config;
}; 