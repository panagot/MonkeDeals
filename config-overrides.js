const webpack = require('webpack');

module.exports = function override(config, env) {
  // Add fallbacks for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer"),
    "util": require.resolve("util"),
    "assert": require.resolve("assert"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "url": require.resolve("url"),
    "zlib": false,
    "fs": false,
    "path": require.resolve("path-browserify"),
    "net": false,
    "tls": false,
    "vm": false, // Disable vm module to prevent conflicts
    "process/browser": require.resolve("process/browser")
  };

  // Ensure proper module resolution for npm packages
  config.resolve.modules = [...(config.resolve.modules || []), 'node_modules'];

  // Ignore problematic @solana/spl-token modules
  config.resolve.alias = {
    ...config.resolve.alias,
    '@solana/spl-token-metadata': false,
    '@solana/spl-token-group': false,
  };

  // Add plugins for polyfills
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
    // Replace problematic @solana/spl-token modules with empty modules
    new webpack.NormalModuleReplacementPlugin(
      /^@solana\/spl-token-metadata$/,
      require.resolve('./node_modules/empty-module/index.js')
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^@solana\/spl-token-group$/,
      require.resolve('./node_modules/empty-module/index.js')
    ),
  ];

  // Handle window object conflicts with browser extensions
  config.optimization = {
    ...config.optimization,
    nodeEnv: false,
  };

  // Add ignore warnings for source maps
  config.ignoreWarnings = [
    /Failed to parse source map/,
    /Module Warning \(from .*source-map-loader/,
  ];

  return config;
};
