/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const {
  withAppBuildGradle,
  withInfoPlist,
  withPodfile,
  withProjectBuildGradle,
  withSettingsGradle,
} = require('expo/config-plugins');

const VK_MAVEN_REPOSITORY = "maven { url 'https://nexus-external.vkteam.ru/repository/maven/' }";

function escapeGroovyString(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function withVkRepository(config, vkClientId, vkClientSecret) {
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
        `vkidManifestPlaceholders {\n  init('${escapeGroovyString(vkClientId)}', '${escapeGroovyString(vkClientSecret)}')\n}\n\napply plugin: "expo-root-project"`,
      );
      exportedConfig.modResults.contents = contents;
    }
    return exportedConfig;
  });
}

function withVkAppPlugin(config, yandexClientId, hasVkCredentials) {
  return withAppBuildGradle(config, (exportedConfig) => {
    let contents = exportedConfig.modResults.contents;
    if (hasVkCredentials && !contents.includes('apply plugin: "vkid.manifest.placeholders"')) {
      contents = contents.replace(
        /apply plugin: "com\.android\.application"\s*\n/,
        '$&apply plugin: "vkid.manifest.placeholders"\n',
      );
    }
    if (yandexClientId && !contents.includes('YANDEX_CLIENT_ID:')) {
      contents = contents.replace(
        /defaultConfig\s*\{/,
        `$&\n        manifestPlaceholders += [YANDEX_CLIENT_ID: '${escapeGroovyString(yandexClientId)}']`,
      );
    }
    exportedConfig.modResults.contents = contents;
    return exportedConfig;
  });
}

function withIosNativeAuth(config, yandexClientId, vkClientId, vkClientSecret) {
  return withInfoPlist(config, (exportedConfig) => {
    const infoPlist = exportedConfig.modResults;

    if (yandexClientId) {
      infoPlist.YANDEX_NATIVE_CLIENT_ID = yandexClientId;

      const querySchemes = Array.isArray(infoPlist.LSApplicationQueriesSchemes)
        ? infoPlist.LSApplicationQueriesSchemes
        : [];
      infoPlist.LSApplicationQueriesSchemes = Array.from(
        new Set([...querySchemes, 'primaryyandexloginsdk', 'secondaryyandexloginsdk']),
      );

      const urlTypes = Array.isArray(infoPlist.CFBundleURLTypes) ? infoPlist.CFBundleURLTypes : [];
      const yandexUrlScheme = `yx${yandexClientId}`;
      const yandexUrlType = urlTypes.find((urlType) => urlType.CFBundleURLName === 'YandexLoginSDK');
      if (yandexUrlType) {
        const schemes = Array.isArray(yandexUrlType.CFBundleURLSchemes) ? yandexUrlType.CFBundleURLSchemes : [];
        yandexUrlType.CFBundleURLSchemes = Array.from(new Set([...schemes, yandexUrlScheme]));
      } else {
        urlTypes.push({ CFBundleURLName: 'YandexLoginSDK', CFBundleURLSchemes: [yandexUrlScheme] });
      }
      infoPlist.CFBundleURLTypes = urlTypes;
    }

    if (vkClientId) {
      infoPlist.VK_NATIVE_IOS_CLIENT_ID = vkClientId;

      const querySchemes = Array.isArray(infoPlist.LSApplicationQueriesSchemes)
        ? infoPlist.LSApplicationQueriesSchemes
        : [];
      infoPlist.LSApplicationQueriesSchemes = Array.from(new Set([...querySchemes, 'vkauthorize-silent']));

      const urlTypes = Array.isArray(infoPlist.CFBundleURLTypes) ? infoPlist.CFBundleURLTypes : [];
      const vkUrlScheme = `vk${vkClientId}`;
      const vkUrlType = urlTypes.find((urlType) => urlType.CFBundleURLName === 'VKID');
      if (vkUrlType) {
        const schemes = Array.isArray(vkUrlType.CFBundleURLSchemes) ? vkUrlType.CFBundleURLSchemes : [];
        vkUrlType.CFBundleURLSchemes = Array.from(new Set([...schemes, vkUrlScheme]));
      } else {
        urlTypes.push({ CFBundleURLName: 'VKID', CFBundleURLSchemes: [vkUrlScheme] });
      }
      infoPlist.CFBundleURLTypes = urlTypes;
    }
    if (vkClientSecret) infoPlist.VK_NATIVE_IOS_CLIENT_SECRET = vkClientSecret;
    return exportedConfig;
  });
}

function withYandexDeprecatedApiCompatibility(config) {
  return withPodfile(config, (exportedConfig) => {
    let contents = exportedConfig.modResults.contents;
    const marker = '# Runich: keep deprecated Security API warnings non-fatal in YandexLoginSDK.';
    if (!contents.includes(marker)) {
      const postInstallBlock = /post_install do \|installer\|/;
      if (!postInstallBlock.test(contents)) {
        throw new Error('Could not add Yandex LoginSDK compiler compatibility settings to the Podfile.');
      }
      const compatibilitySettings = [
        `    ${marker}`,
        '    installer.pods_project.targets.each do |target|',
        "      next unless target.name == 'YandexLoginSDK'",
        '      target.build_configurations.each do |build_configuration|',
        '        %w[OTHER_CFLAGS OTHER_CPLUSPLUSFLAGS].each do |setting|',
        '          flags = build_configuration.build_settings[setting]',
        '          flags = flags.join(" ") if flags.is_a?(Array)',
        '          flags = flags.to_s',
        "          unless flags.include?('-Wno-error=deprecated-declarations')",
        '            build_configuration.build_settings[setting] = "#{flags} -Wno-error=deprecated-declarations".strip',
        '          end',
        '        end',
        '      end',
        '    end',
      ].join('\n');
      contents = contents.replace(postInstallBlock, `$&\n${compatibilitySettings}`);
      exportedConfig.modResults.contents = contents;
    }
    return exportedConfig;
  });
}

module.exports = function withNativeAuth(config) {
  const yandexClientId = process.env.YANDEX_NATIVE_CLIENT_ID || '';
  const vkAndroidClientId = process.env.VK_NATIVE_ANDROID_CLIENT_ID || '';
  const vkAndroidClientSecret = process.env.VK_NATIVE_ANDROID_CLIENT_SECRET || '';
  const vkIosClientId = process.env.VK_NATIVE_IOS_CLIENT_ID || '';
  const vkIosClientSecret = process.env.VK_NATIVE_IOS_CLIENT_SECRET || '';
  const hasAndroidVkCredentials = Boolean(vkAndroidClientId && vkAndroidClientSecret);

  if (hasAndroidVkCredentials) {
    config = withVkRepository(config, vkAndroidClientId, vkAndroidClientSecret);
  }
  if (hasAndroidVkCredentials || yandexClientId) {
    config = withVkAppPlugin(config, yandexClientId, hasAndroidVkCredentials);
  }
  if (yandexClientId) {
    config = withYandexDeprecatedApiCompatibility(config);
  }
  return withIosNativeAuth(config, yandexClientId, vkIosClientId, vkIosClientSecret);
};
