const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Scope watchFolders strictly to current MobileApp directory
config.watchFolders = [__dirname];

// Block Metro from crawling backend or parent App folders
config.resolver.blockList = [
  /.*\/backend\/.*/,
  /.*\/App\/.*/,
  /.*\.git\/.*/,
  /.*\.log$/,
];

module.exports = config;
