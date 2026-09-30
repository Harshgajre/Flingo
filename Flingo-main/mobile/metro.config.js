const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ignore nested node_modules to prevent TreeFS path traversal crash on Windows
config.resolver.blockList = [
  /node_modules\/.*\/node_modules\/.*/,
  /node_modules\\.*\\node_modules\\.*/
];

module.exports = config;
