const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'node_modules', '@expo', 'cli', 'build', 'src', 'start');

// Patch 1: createExpoAutolinkingResolver.js (Instant offline bypass)
const autolinkPath = path.join(baseDir, 'server', 'metro', 'createExpoAutolinkingResolver.js');
if (fs.existsSync(autolinkPath)) {
  let content = fs.readFileSync(autolinkPath, 'utf8');
  if (!content.includes("EXPO_OFFLINE")) {
    content = content.replace(
      "async function createAutolinkingModuleResolverInput({ platforms, projectRoot }) {",
      "async function createAutolinkingModuleResolverInput({ platforms, projectRoot }) {\n    if (require('../../../utils/env').env.EXPO_OFFLINE) return {};"
    );
    fs.writeFileSync(autolinkPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched createExpoAutolinkingResolver.js');
  }
}

// Patch 2: DevToolsPluginManager.js (Instant offline bypass for autolinking)
const devToolsPath = path.join(baseDir, 'server', 'DevToolsPluginManager.js');
if (fs.existsSync(devToolsPath)) {
  let content = fs.readFileSync(devToolsPath, 'utf8');
  if (!content.includes("EXPO_OFFLINE")) {
    content = content.replace(
      "async queryAutolinkedPluginsAsync(projectRoot) {",
      "async queryAutolinkedPluginsAsync(projectRoot) {\n        if (require('../../utils/env').env.EXPO_OFFLINE) return [];"
    );
    fs.writeFileSync(devToolsPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched DevToolsPluginManager.js');
  }
}

// Patch 3: instantiateMetro.js (Strict serverRoot isolation)
const instantiateMetroPath = path.join(baseDir, 'server', 'metro', 'instantiateMetro.js');
if (fs.existsSync(instantiateMetroPath)) {
  let content = fs.readFileSync(instantiateMetroPath, 'utf8');
  if (!content.includes("isWorkspace = false")) {
    content = content.replace(
      "const isWorkspace = serverRoot !== projectRoot;",
      "const isWorkspace = false;\n    serverRoot = projectRoot;"
    );
    fs.writeFileSync(instantiateMetroPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched instantiateMetro.js');
  }
}

// Patch 4: start/index.js (Force offline mode and telemetry disable)
const startIndexPath = path.join(baseDir, 'index.js');
if (fs.existsSync(startIndexPath)) {
  let content = fs.readFileSync(startIndexPath, 'utf8');
  if (!content.includes("process.env.EXPO_OFFLINE = '1';")) {
    content = content.replace(
      "const expoStart = async (argv)=>{",
      "const expoStart = async (argv)=>{\n    process.env.EXPO_NO_TELEMETRY = '1';\n    process.env.EXPO_OFFLINE = '1';"
    );
    content = content.replace(
      "options.offline = true;",
      "if (options) { options.offline = true; }"
    );
    fs.writeFileSync(startIndexPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched start/index.js (offline & telemetry)');
  }
}

// Patch 5: utils/port.js (Auto-switch port if 8081 is busy instead of blocking on interactive prompt)
const portUtilsPath = path.join(__dirname, '..', 'node_modules', '@expo', 'cli', 'build', 'src', 'utils', 'port.js');
if (fs.existsSync(portUtilsPath)) {
  let content = fs.readFileSync(portUtilsPath, 'utf8');
  if (!content.includes("/* patched auto port fallback */")) {
    content = content.replace(
      "const change = await confirmAsync({",
      "/* patched auto port fallback */ return port;\n        const change = await confirmAsync({"
    );
    fs.writeFileSync(portUtilsPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched utils/port.js (auto port fallback)');
  }
}

// Patch 6: bin/cli (Disable telemetry, force offline, disable TypeScript setup, disable workspace root scan)
const cliBinPath = path.join(__dirname, '..', 'node_modules', '@expo', 'cli', 'build', 'bin', 'cli');
if (fs.existsSync(cliBinPath)) {
  let content = fs.readFileSync(cliBinPath, 'utf8');
  if (!content.includes("/* patched fast env */")) {
    content = content.replace(
      '"use strict";',
      '"use strict";\n/* patched fast env */ process.env.EXPO_NO_TELEMETRY="1"; process.env.EXPO_OFFLINE="1"; process.env.EXPO_NO_DEPENDENCY_VALIDATION="1"; process.env.EXPO_NO_TYPESCRIPT_SETUP="1"; process.env.EXPO_NO_METRO_WORKSPACE_ROOT="1";'
    );
    fs.writeFileSync(cliBinPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched bin/cli (disable telemetry & force offline)');
  }
}

// Patch 7: expo-modules-autolinking resolution.js (Instant offline bypass for recursive dependency scanning)
const autolinkingResolutionPath = path.join(__dirname, '..', 'node_modules', 'expo-modules-autolinking', 'build', 'dependencies', 'resolution.js');
if (fs.existsSync(autolinkingResolutionPath)) {
  let content = fs.readFileSync(autolinkingResolutionPath, 'utf8');
  if (!content.includes("if (process.env.EXPO_OFFLINE) return {};")) {
    content = content.replace(
      "async function scanDependenciesRecursively(rawPath, { shouldIncludeDependency = utils_1.defaultShouldIncludeDependency, limitDepth } = {}) {",
      "async function scanDependenciesRecursively(rawPath, { shouldIncludeDependency = utils_1.defaultShouldIncludeDependency, limitDepth } = {}) {\n    if (process.env.EXPO_OFFLINE) return {};"
    );
    fs.writeFileSync(autolinkingResolutionPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched expo-modules-autolinking resolution.js');
  }
}

// Patch 8: clearNativeFolder.js (Bypass native module autolinking check)
const clearNativePath = path.join(baseDir, 'prebuild', 'clearNativeFolder.js');
if (fs.existsSync(clearNativePath)) {
  let content = fs.readFileSync(clearNativePath, 'utf8');
  if (!content.includes("EXPO_OFFLINE")) {
    content = content.replace(
      "async function maybeBailOnNativeModuleAsync(projectRoot) {",
      "async function maybeBailOnNativeModuleAsync(projectRoot) {\n    if (require('../utils/env').env.EXPO_OFFLINE) return false;"
    );
    fs.writeFileSync(clearNativePath, content, 'utf8');
    console.log('[patch-expo-cli] Patched clearNativeFolder.js');
  }
}

// Patch 9: createDebugMiddleware.js (Disable background debugger-shell download in offline mode)
const debugMiddlewarePath = path.join(baseDir, 'server', 'metro', 'debugging', 'createDebugMiddleware.js');
if (fs.existsSync(debugMiddlewarePath)) {
  let content = fs.readFileSync(debugMiddlewarePath, 'utf8');
  if (!content.includes("EXPO_OFFLINE")) {
    content = content.replace(
      "enableStandaloneFuseboxShell: !(0, _env.envIsHeadless)()",
      "enableStandaloneFuseboxShell: !_env.env.EXPO_OFFLINE && !(0, _env.envIsHeadless)()"
    );
    fs.writeFileSync(debugMiddlewarePath, content, 'utf8');
    console.log('[patch-expo-cli] Patched createDebugMiddleware.js');
  }
}

// Patch 10: resolveOptions.js (Safe host resolution without BAD_ARGS error)
const resolveOptionsPath = path.join(baseDir, 'resolveOptions.js');
if (fs.existsSync(resolveOptionsPath)) {
  let content = fs.readFileSync(resolveOptionsPath, 'utf8');
  if (!content.includes("/* patched resolveHostType */")) {
    content = content.replace(
      "function resolveHostType(options) {",
      "function resolveHostType(options) {\n    /* patched resolveHostType */ return options.host ?? (options.localhost ? 'localhost' : (options.tunnel ? 'tunnel' : 'lan'));"
    );
    fs.writeFileSync(resolveOptionsPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched resolveOptions.js');
  }
}


// Patch 11: BundlerDevServer.js (Non-blocking DevSession and Bonjour to avoid 36s startup delay)
const bundlerDevServerPath = path.join(baseDir, 'server', 'BundlerDevServer.js');
if (fs.existsSync(bundlerDevServerPath)) {
  let content = fs.readFileSync(bundlerDevServerPath, 'utf8');
  if (!content.includes("/* patched non-blocking postStart */")) {
    content = content.replace(
      "await Promise.all([\n                this.startDevSessionAsync(),\n                this.startBonjourAsync()\n            ]);",
      "/* patched non-blocking postStart */ if (!require('../../utils/env').env.EXPO_OFFLINE) { Promise.all([this.startDevSessionAsync().catch(() => {}), this.startBonjourAsync().catch(() => {})]); }"
    );
    fs.writeFileSync(bundlerDevServerPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched BundlerDevServer.js (non-blocking postStart)');
  }
}

// Patch 12: DevToolsPluginManager.js (Bypass 2.5 min autolinked plugin scanning)
const devToolsPluginMgrPath = path.join(baseDir, 'server', 'DevToolsPluginManager.js');
if (fs.existsSync(devToolsPluginMgrPath)) {
  let content = fs.readFileSync(devToolsPluginMgrPath, 'utf8');
  if (!content.includes("/* patched fast plugins */")) {
    content = content.replace(
      "async queryAutolinkedPluginsAsync(projectRoot) {",
      "async queryAutolinkedPluginsAsync(projectRoot) {\n        /* patched fast plugins */ return [];"
    );
    fs.writeFileSync(devToolsPluginMgrPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched DevToolsPluginManager.js (fast plugins)');
  }
}

// Patch 13: DevServerManager.js (Instant bootstrapTypeScriptAsync return)
const devServerMgrPath = path.join(baseDir, 'server', 'DevServerManager.js');
if (fs.existsSync(devServerMgrPath)) {
  let content = fs.readFileSync(devServerMgrPath, 'utf8');
  if (!content.includes("/* patched fast ts setup */")) {
    content = content.replace(
      "async bootstrapTypeScriptAsync() {\n        const typescriptPrerequisite",
      "async bootstrapTypeScriptAsync() {\n        /* patched fast ts setup */ if (require('../../utils/env').env.EXPO_NO_TYPESCRIPT_SETUP) return;\n        const typescriptPrerequisite"
    );
    fs.writeFileSync(devServerMgrPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched DevServerManager.js (fast ts setup)');
  }
}

// Patch 14: DiskCacheManager.js (Handle corrupted V8 cache deserialization gracefully)
const diskCacheMgrPath = path.join(process.cwd(), 'node_modules', '@expo', 'metro-file-map', 'build', 'cache', 'DiskCacheManager.js');
if (fs.existsSync(diskCacheMgrPath)) {
  let content = fs.readFileSync(diskCacheMgrPath, 'utf8');
  if (!content.includes("/* patched safe cache read */")) {
    content = content.replace(
      "async read() {",
      "async read() {\n        /* patched safe cache read */ try { return require('v8').deserialize(await require('fs').promises.readFile(this.#cachePath)); } catch { try { await require('fs').promises.unlink(this.#cachePath); } catch {} return null; }"
    );
    fs.writeFileSync(diskCacheMgrPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched DiskCacheManager.js (safe cache read)');
  }
}

// Patch 15: runServer-fork.js (Instant HTTP server bind with waitForBundler: false)
const runServerForkPath = path.join(baseDir, 'server', 'metro', 'runServer-fork.js');
if (fs.existsSync(runServerForkPath)) {
  let content = fs.readFileSync(runServerForkPath, 'utf8');
  if (!content.includes("/* patched instant listen */")) {
    content = content.replace(
      "waitForBundler,",
      "/* patched instant listen */ waitForBundler: false,"
    );
    fs.writeFileSync(runServerForkPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched runServer-fork.js (instant listen)');
  }
}

// Patch 16: resolveOptions.js (Instant resolveSchemeAsync return)
if (fs.existsSync(resolveOptionsPath)) {
  let content = fs.readFileSync(resolveOptionsPath, 'utf8');
  if (!content.includes("/* patched fast scheme */")) {
    content = content.replace(
      "async function resolveSchemeAsync(projectRoot, options) {",
      "async function resolveSchemeAsync(projectRoot, options) {\n    /* patched fast scheme */ return options.scheme ?? null;"
    );
    fs.writeFileSync(resolveOptionsPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched resolveOptions.js (fast scheme)');
  }
}

// Patch 17: runServer-fork.js (Fix middleware assertion for function middleware)
if (fs.existsSync(runServerForkPath)) {
  let content = fs.readFileSync(runServerForkPath, 'utf8');
  if (!content.includes("/* patched middleware check */")) {
    content = content.replace(
      "(0, _assert().default)(typeof middleware.use === 'function');",
      "/* patched middleware check */ (0, _assert().default)(typeof middleware === 'function' || typeof (middleware == null ? void 0 : middleware.use) === 'function');"
    );
    fs.writeFileSync(runServerForkPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched runServer-fork.js (middleware check)');
  }
}

// Patch 18: getRunningProcess.js (Instant return null)
const getRunningProcessPath = path.join(__dirname, '../node_modules/@expo/cli/build/src/utils/getRunningProcess.js');
if (fs.existsSync(getRunningProcessPath)) {
  let content = fs.readFileSync(getRunningProcessPath, 'utf8');
  if (!content.includes("/* patched fast getRunningProcess */")) {
    content = content.replace(
      "async function getRunningProcess(port) {",
      "async function getRunningProcess(port) {\n    /* patched fast getRunningProcess */ return null;"
    );
    fs.writeFileSync(getRunningProcessPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched getRunningProcess.js (fast process check)');
  }
}

// Patch 19: metro-config/src/index.js (Disable metro-babel-register)
const metroConfigIndexPath = path.join(__dirname, '../node_modules/metro-config/src/index.js');
if (fs.existsSync(metroConfigIndexPath)) {
  let content = fs.readFileSync(metroConfigIndexPath, 'utf8');
  if (!content.includes("/* patched disable metro-babel-register */")) {
    content = content.replace(
      'require("metro-babel-register").unstable_registerForMetroMonorepo();',
      '/* patched disable metro-babel-register */ // require("metro-babel-register").unstable_registerForMetroMonorepo();'
    );
    fs.writeFileSync(metroConfigIndexPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched metro-config/src/index.js (disabled babel register)');
  }
}

// Patch 20: getWatchFolders.js (Instant return [])
const getWatchFoldersPath = path.join(__dirname, '../node_modules/@expo/metro-config/build/getWatchFolders.js');
if (fs.existsSync(getWatchFoldersPath)) {
  let content = fs.readFileSync(getWatchFoldersPath, 'utf8');
  if (!content.includes("/* patched fast getWatchFolders */")) {
    content = content.replace(
      "function getWatchFolders(projectRoot) {",
      "function getWatchFolders(projectRoot) {\n    /* patched fast getWatchFolders */ return [];"
    );
    fs.writeFileSync(getWatchFoldersPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched getWatchFolders.js (fast watch folders)');
  }
}

// Patch 21: getPkgVersion.js (Instant return null)
const getPkgVersionPath = path.join(__dirname, '../node_modules/@expo/metro-config/build/utils/getPkgVersion.js');
if (fs.existsSync(getPkgVersionPath)) {
  let content = fs.readFileSync(getPkgVersionPath, 'utf8');
  if (!content.includes("/* patched fast getPkgVersion */")) {
    content = content.replace(
      "function getPkgVersion(projectRoot, pkgName) {",
      "function getPkgVersion(projectRoot, pkgName) {\n    /* patched fast getPkgVersion */ return null;"
    );
    fs.writeFileSync(getPkgVersionPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched getPkgVersion.js (fast pkg version)');
  }
}

// Patch 22: @expo/config/build/paths/paths.js (Instant getMetroServerRoot return)
const pathsPath = path.join(__dirname, '../node_modules/@expo/config/build/paths/paths.js');
if (fs.existsSync(pathsPath)) {
  let content = fs.readFileSync(pathsPath, 'utf8');
  if (!content.includes("/* patched fast server root */")) {
    content = content.replace(
      "function getMetroServerRoot(projectRoot) {",
      "function getMetroServerRoot(projectRoot) {\n  /* patched fast server root */ return _path().default.resolve(projectRoot);"
    );
    fs.writeFileSync(pathsPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched paths.js (fast server root)');
  }
}

// Patch 23: ExpoMetroConfig.js (Fast path react-native, expo-router, and direct metro-config imports)
const expoMetroConfigPath = path.join(__dirname, '../node_modules/@expo/metro-config/build/ExpoMetroConfig.js');
if (fs.existsSync(expoMetroConfigPath)) {
  let content = fs.readFileSync(expoMetroConfigPath, 'utf8');
  if (!content.includes("/* patched fast rn path */")) {
    content = content.replace(
      "const { getDefaultConfig: getDefaultMetroConfig, mergeConfig, } = require('@expo/metro/metro-config');",
      "/* patched fast metro imports */ const getDefaultMetroConfig = require('metro-config/private/defaults/index'); const { mergeConfig } = require('metro-config/private/loadConfig');"
    );
    content = content.replace(
      "const metroDefaultValues = getDefaultMetroConfig.getDefaultValues(projectRoot);",
      "/* patched fast default values */ const metroDefaultValues = (getDefaultMetroConfig.getDefaultValues ?? getDefaultMetroConfig.default?.getDefaultValues ?? getDefaultMetroConfig.default ?? getDefaultMetroConfig)(projectRoot);"
    );
    content = content.replace(
      "const reactNativePath = path_1.default.dirname(resolve_from_1.default.silent(projectRoot, 'react-native/package.json') ?? 'react-native/package.json');",
      "/* patched fast rn path */ const reactNativePath = path_1.default.join(projectRoot, 'node_modules/react-native');"
    );
    content = content.replace(
      "const routerPackageRoot = resolve_from_1.default.silent(projectRoot, 'expo-router');",
      "/* patched fast router path */ const routerPackageRoot = path_1.default.join(projectRoot, 'node_modules/expo-router');"
    );
    fs.writeFileSync(expoMetroConfigPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched ExpoMetroConfig.js (fast package resolution)');
  }
}




// Patch 24: metro-config/src/loadConfig.js (Fast path searchForConfigFile)
const loadConfigPath = path.join(__dirname, '../node_modules/metro-config/src/loadConfig.js');
if (fs.existsSync(loadConfigPath)) {
  let content = fs.readFileSync(loadConfigPath, 'utf8');
  if (!content.includes("directConfig")) {
    content = content.replace(
      "function searchForConfigFile(absoluteStartDir, absoluteStopDir) {",
      'function searchForConfigFile(absoluteStartDir, absoluteStopDir) {\n  const directConfig = path.join(absoluteStartDir, "metro.config.js");\n  if (fs.existsSync(directConfig)) return directConfig;'
    );
    fs.writeFileSync(loadConfigPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched loadConfig.js (fast config search)');
  }
}

// Patch 25: ExpoMetroConfig.js (Fast path helper functions)
const expoMetroConfigPath2 = path.join(__dirname, '../node_modules/@expo/metro-config/build/ExpoMetroConfig.js');
if (fs.existsSync(expoMetroConfigPath2)) {
  let content = fs.readFileSync(expoMetroConfigPath2, 'utf8');
  if (!content.includes("/* patched fast helpers */")) {
    content = content.replace(
      "function getReactNativeHostPath(projectRoot, platform) {",
      "function getReactNativeHostPath(projectRoot, platform) {\n  /* patched fast helpers */ return path_1.default.join(projectRoot, 'node_modules/react-native');"
    );
    content = content.replace(
      /function getExpoOptional\(projectRoot, subModule = 'package\.json'\) \{[\s\S]*?\}\n\}/,
      "function getExpoOptional(projectRoot, subModule = 'package.json') {\n    const pth = path_1.default.join(projectRoot, 'node_modules/expo', subModule);\n    return require('fs').existsSync(pth) ? pth : null;\n}"
    );
    content = content.replace(
      /function getExpoMetroRuntimeOptional\(projectRoot\) \{[\s\S]*?return null;\n\}/,
      "function getExpoMetroRuntimeOptional(projectRoot) {\n    const pth = path_1.default.join(projectRoot, 'node_modules/@expo/metro-runtime');\n    return require('fs').existsSync(pth) ? pth : null;\n}"
    );
    fs.writeFileSync(expoMetroConfigPath2, content, 'utf8');
    console.log('[patch-expo-cli] Patched ExpoMetroConfig.js (fast helper functions)');
  }
}

// Patch 26: resolveMetroUserConfig.js (Fast direct check for metro.config.js)
const resolveMetroUserConfigPath = path.join(__dirname, '../node_modules/@expo/metro-config/build/config/resolveMetroUserConfig.js');
if (fs.existsSync(resolveMetroUserConfigPath)) {
  let content = fs.readFileSync(resolveMetroUserConfigPath, 'utf8');
  if (!content.includes("directMetroConfig")) {
    content = content.replace(
      "async function resolveMetroUserConfig(params) {",
      "async function resolveMetroUserConfig(params) {\n    const directMetroConfig = node_path_1.default.join(params.projectRoot, 'metro.config.js');\n    if (node_fs_1.default.existsSync(directMetroConfig)) {\n        return loadConfigFile(directMetroConfig);\n    }"
    );
    fs.writeFileSync(resolveMetroUserConfigPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched resolveMetroUserConfig.js (fast config check)');
  }
}

// Patch 27: BundlerDevServer.js (Idempotent initUrlCreator)
const bundlerDevServerPath2 = path.join(__dirname, '../node_modules/@expo/cli/build/src/start/server/BundlerDevServer.js');
if (fs.existsSync(bundlerDevServerPath2)) {
  let content = fs.readFileSync(bundlerDevServerPath2, 'utf8');
  if (!content.includes("if (this.urlCreator) return this.urlCreator;")) {
    content = content.replace(
      "(0, _assert().default)(!this.urlCreator, 'Dev server is already initialized');",
      "if (this.urlCreator) return this.urlCreator;"
    );
    fs.writeFileSync(bundlerDevServerPath2, content, 'utf8');
    console.log('[patch-expo-cli] Patched BundlerDevServer.js (idempotent initUrlCreator)');
  }
}

// Patch 28: createFileMap.js (Fast file map building with retainAllFiles false)
const createFileMapPath = path.join(__dirname, '../node_modules/metro/src/node-haste/DependencyGraph/createFileMap.js');
if (fs.existsSync(createFileMapPath)) {
  let content = fs.readFileSync(createFileMapPath, 'utf8');
  if (content.includes("retainAllFiles: true,")) {
    content = content.replace("retainAllFiles: true,", "retainAllFiles: false,");
    content = content.replace("roots: config.watchFolders,", "roots: [config.projectRoot],");
    fs.writeFileSync(createFileMapPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched createFileMap.js (fast file map building)');
  }
}

// Patch 29: metro-file-map/src/index.js (Fast node_modules ignore in ignoreForCrawl)
const metroFileMapIndexPath = path.join(__dirname, '../node_modules/metro-file-map/src/index.js');
if (fs.existsSync(metroFileMapIndexPath)) {
  let content = fs.readFileSync(metroFileMapIndexPath, 'utf8');
  if (content.includes("filePath.includes(NODE_MODULES)")) {
    content = content.replace(
      "filePath.includes(NODE_MODULES)",
      "(filePath.includes('node_modules') || filePath.startsWith('.git'))"
    );
    fs.writeFileSync(metroFileMapIndexPath, content, 'utf8');
    console.log('[patch-expo-cli] Patched metro-file-map/src/index.js (fast ignoreForCrawl)');
  }
}

console.log('[patch-expo-cli] Expo CLI patches applied successfully.');

