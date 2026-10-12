const fs = require('fs');
const path = require('path');
const {
  withAppBuildGradle,
  withDangerousMod,
  withGradleProperties,
  withProjectBuildGradle,
} = require('expo/config-plugins');

const HUAWEI_MAVEN_REPOSITORY = "maven { url 'https://developer.huawei.com/repo/' }";
const AGCONNECT_PLUGIN_VERSION = '1.9.6.300';

function setGradlePropertiesValue(config, key, value) {
  return withGradleProperties(config, (exportedConfig) => {
    const keyIdx = exportedConfig.modResults.findIndex((item) => item.type === 'property' && item.key === key);
    if (keyIdx >= 0) {
      exportedConfig.modResults.splice(keyIdx, 1, {
        type: 'property',
        key,
        value,
      });
    } else {
      exportedConfig.modResults.push({
        type: 'property',
        key,
        value,
      });
    }

    return exportedConfig;
  });
}

function addHuaweiMavenRepository(contents, scope) {
  const pattern = new RegExp(`(${scope}\\s*\\{\\s*repositories\\s*\\{)([\\s\\S]*?)(\\n\\s*\\})`);
  const match = contents.match(pattern);
  if (!match) {
    throw new Error(`Could not add the Huawei Maven repository to the ${scope} repositories.`);
  }
  if (match[2].includes(HUAWEI_MAVEN_REPOSITORY)) {
    return contents;
  }

  return contents.replace(pattern, `$1\n    ${HUAWEI_MAVEN_REPOSITORY}$2$3`);
}

function withHuaweiLocationBuildConfig(config, agConnectServicesFile) {
  config = withProjectBuildGradle(config, (exportedConfig) => {
    let contents = exportedConfig.modResults.contents;
    contents = addHuaweiMavenRepository(contents, 'allprojects');

    if (agConnectServicesFile) {
      contents = addHuaweiMavenRepository(contents, 'buildscript');
      if (!contents.includes('com.huawei.agconnect:agcp:')) {
        const dependenciesBlock = /(buildscript\s*\{[\s\S]*?dependencies\s*\{)/;
        if (!dependenciesBlock.test(contents)) {
          throw new Error('Could not add the AppGallery Connect Gradle plugin dependency.');
        }
        contents = contents.replace(
          dependenciesBlock,
          `$1\n    classpath 'com.huawei.agconnect:agcp:${AGCONNECT_PLUGIN_VERSION}'`,
        );
      }
    }

    exportedConfig.modResults.contents = contents;
    return exportedConfig;
  });

  if (agConnectServicesFile) {
    config = withAppBuildGradle(config, (exportedConfig) => {
      const contents = exportedConfig.modResults.contents;
      if (!contents.includes('com.huawei.agconnect')) {
        const applicationPlugin = /(apply plugin:\s*["']com\.android\.application["']\s*\n)/;
        if (!applicationPlugin.test(contents)) {
          throw new Error('Could not apply the AppGallery Connect Gradle plugin to the Android app.');
        }
        exportedConfig.modResults.contents = contents.replace(
          applicationPlugin,
          `$1apply plugin: "com.huawei.agconnect"\n`,
        );
      }
      return exportedConfig;
    });

    config = withDangerousMod(config, [
      'android',
      async (exportedConfig) => {
        const projectRoot = exportedConfig.modRequest.projectRoot;
        const sourcePath = path.resolve(projectRoot, agConnectServicesFile);
        if (!fs.existsSync(sourcePath)) {
          throw new Error('HUAWEI_AGCONNECT_SERVICES_FILE points to a missing AppGallery Connect configuration file.');
        }

        const targetPath = path.join(exportedConfig.modRequest.platformProjectRoot, 'app', 'agconnect-services.json');
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        if (path.resolve(sourcePath) !== path.resolve(targetPath)) {
          fs.copyFileSync(sourcePath, targetPath);
        }
        return exportedConfig;
      },
    ]);
  }

  return config;
}

module.exports = function withCustomPlugin(config) {
  config = setGradlePropertiesValue(
    config,
    'org.gradle.jvmargs',
    '-Xmx4096m -XX:MaxMetaspaceSize=2048m --enable-native-access=ALL-UNNAMED',
  );

  return withHuaweiLocationBuildConfig(config, process.env.HUAWEI_AGCONNECT_SERVICES_FILE);
};
