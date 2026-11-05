/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const { withAppBuildGradle, withProjectBuildGradle, withSettingsGradle } = require('expo/config-plugins');

const VK_MAVEN_REPOSITORY = "maven { url 'https://nexus-external.vkteam.ru/repository/maven/' }";

function escapeGroovyString(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function withVkRepository(config, vkIdClientId, vkIdClientSecret) {
  config = withSettingsGradle(config, (exportedConfig) => {
    let contents = exportedConfig.modResults.contents;
    if (!contents.includes(VK_MAVEN_REPOSITORY)) {
      const pluginManagement = /pluginManagement\s*\{/;
      if (!pluginManagement.test(contents)) {
        throw new Error('Could not add the VK ID Maven repository to pluginManagement.');
      }
      contents = contents.replace(
        pluginManagement,
        `$&\n  repositories {\n    google()\n    mavenCentral()\n    gradlePluginPortal()\n    ${VK_MAVEN_REPOSITORY}\n  }`,
      );
      exportedConfig.modResults.contents = contents;
    }
    return exportedConfig;
  });

  return withProjectBuildGradle(config, (exportedConfig) => {
    let contents = exportedConfig.modResults.contents;
    if (!contents.includes(VK_MAVEN_REPOSITORY)) {
      const rootPlugin = "plugins { id 'vkid.manifest.placeholders' version '1.1.0' apply true }";
      if (!contents.includes(rootPlugin)) {
        const allProjectsBlock = /\nallprojects\s*\{/;
        if (!allProjectsBlock.test(contents)) {
          throw new Error('Could not find the Android allprojects block for VK ID setup.');
        }
        contents = contents.replace(allProjectsBlock, `\n${rootPlugin}\n\nallprojects {`);
      }

      contents = contents.replace(
        /allprojects\s*\{\s*repositories\s*\{/,
        (match) => `${match}\n    ${VK_MAVEN_REPOSITORY}`,
      );
      contents = contents.replace(
        /apply plugin: "expo-root-project"/,
        `vkidManifestPlaceholders {\n  init('${escapeGroovyString(vkIdClientId)}', '${escapeGroovyString(vkIdClientSecret)}')\n}\n\napply plugin: "expo-root-project"`,
      );
      exportedConfig.modResults.contents = contents;
    }
    return exportedConfig;
  });
}

function withVkAppPlugin(config, yandexClientId) {
  return withAppBuildGradle(config, (exportedConfig) => {
    let contents = exportedConfig.modResults.contents;
    if (!contents.includes('apply plugin: "vkid.manifest.placeholders"')) {
      contents = contents.replace(
        /apply plugin: "com\.android\.application"\s*\n/,
        '$&apply plugin: "vkid.manifest.placeholders"\n',
      );
    }
    if (!contents.includes('YANDEX_CLIENT_ID:')) {
      contents = contents.replace(
        /defaultConfig\s*\{/,
        `$&\n        manifestPlaceholders += [YANDEX_CLIENT_ID: '${yandexClientId}']`,
      );
    }
    exportedConfig.modResults.contents = contents;
    return exportedConfig;
  });
}

module.exports = function withNativeAuth(config) {
  const yandexClientId = config.extra?.yandexClientId || process.env.YANDEX_CLIENT_ID || '';
  const vkIdClientId =
    config.extra?.vkIdClientId || process.env.VK_NATIVE_CLIENT_ID || process.env.VKID_CLIENT_ID || '';
  const vkIdClientSecret = process.env.VK_NATIVE_CLIENT_SECRET || '';
  return withVkAppPlugin(withVkRepository(config, vkIdClientId, vkIdClientSecret), yandexClientId);
};
