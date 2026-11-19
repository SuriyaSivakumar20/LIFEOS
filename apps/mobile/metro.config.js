const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files within the monorepo
config.watchFolders = [monorepoRoot];

// Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Direct resolution for workspace packages
config.resolver.extraNodeModules = {
  '@lifeos/core': path.resolve(monorepoRoot, 'packages/core/src'),
  '@lifeos/database': path.resolve(monorepoRoot, 'packages/database/src'),
  '@lifeos/shared-types': path.resolve(monorepoRoot, 'packages/shared-types/src'),
  '@lifeos/ui': path.resolve(monorepoRoot, 'packages/ui/src'),
  '@lifeos/alfred': path.resolve(monorepoRoot, 'packages/alfred/src'),
  '@lifeos/voice': path.resolve(monorepoRoot, 'packages/voice/src'),
  '@lifeos/notifications': path.resolve(monorepoRoot, 'packages/notifications/src'),
};

module.exports = config;
