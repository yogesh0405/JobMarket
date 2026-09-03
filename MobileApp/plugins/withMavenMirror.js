const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withMavenMirror(config) {
  return withProjectBuildGradle(config, (modConfig) => {
    let contents = modConfig.modResults.contents;

    // Replace mavenCentral() with Google's Maven Central mirror + repo1 to eliminate 429 Too Many Requests
    const mirrorBlock = "maven { url 'https://maven-central.storage-download.googleapis.com/maven2/' }\n        maven { url 'https://repo1.maven.org/maven2/' }";

    contents = contents.replace(/mavenCentral\(\)/g, mirrorBlock);

    modConfig.modResults.contents = contents;
    return modConfig;
  });
};
