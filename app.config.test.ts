/* eslint-disable @typescript-eslint/consistent-type-imports */
type AppConfig = typeof import('./app.config').default;

function loadAppConfig() {
  let appConfig: AppConfig | undefined;
  jest.isolateModules(() => {
    appConfig = jest.requireActual<typeof import('./app.config')>('./app.config').default;
  });
  if (!appConfig) throw new Error('Failed to load Expo app config.');
  return appConfig;
}

describe('Expo app config', () => {
  const originalYandexClientId = process.env.YANDEX_NATIVE_CLIENT_ID;
  const originalVkAndroidClientId = process.env.VK_NATIVE_ANDROID_CLIENT_ID;
  const originalVkIosClientId = process.env.VK_NATIVE_IOS_CLIENT_ID;
  const originalAppVariant = process.env.APP_VARIANT;
  const originalBaseUrl = process.env.EXPO_PUBLIC_BASE_URL;

  afterEach(() => {
    if (originalYandexClientId === undefined) delete process.env.YANDEX_NATIVE_CLIENT_ID;
    else process.env.YANDEX_NATIVE_CLIENT_ID = originalYandexClientId;

    if (originalVkAndroidClientId === undefined) delete process.env.VK_NATIVE_ANDROID_CLIENT_ID;
    else process.env.VK_NATIVE_ANDROID_CLIENT_ID = originalVkAndroidClientId;

    if (originalVkIosClientId === undefined) delete process.env.VK_NATIVE_IOS_CLIENT_ID;
    else process.env.VK_NATIVE_IOS_CLIENT_ID = originalVkIosClientId;

    if (originalAppVariant === undefined) delete process.env.APP_VARIANT;
    else process.env.APP_VARIANT = originalAppVariant;

    if (originalBaseUrl === undefined) delete process.env.EXPO_PUBLIC_BASE_URL;
    else process.env.EXPO_PUBLIC_BASE_URL = originalBaseUrl;

    jest.resetModules();
  });

  it('adds the Yandex Universal Link domain and platform-specific VK client IDs', () => {
    process.env.YANDEX_NATIVE_CLIENT_ID = 'yandex-client-id';
    process.env.VK_NATIVE_ANDROID_CLIENT_ID = 'vk-android-client-id';
    process.env.VK_NATIVE_IOS_CLIENT_ID = 'vk-ios-client-id';

    const { expo } = loadAppConfig();

    expect(expo.ios.associatedDomains).toContain('applinks:yxyandex-client-id.oauth.yandex.ru');
    expect(expo.extra.vkAndroidClientId).toBe('vk-android-client-id');
    expect(expo.extra.vkIosClientId).toBe('vk-ios-client-id');
  });

  it('omits the Yandex Universal Link domain when its client ID is missing', () => {
    delete process.env.YANDEX_NATIVE_CLIENT_ID;

    const { expo } = loadAppConfig();

    expect(expo.ios.associatedDomains.some((domain) => domain.endsWith('.oauth.yandex.ru'))).toBe(false);
  });

  it('uses the development app identity and stage router origin', () => {
    process.env.APP_VARIANT = 'development';
    process.env.EXPO_PUBLIC_BASE_URL = 'https://stage.runich-app.ru';

    const { expo } = loadAppConfig();

    expect(expo.name).toBe('Runich(dev)');
    expect(expo.scheme).toBe('runich-dev');
    expect(expo.ios.bundleIdentifier).toBe('com.sanich123.runich.dev');
    expect(expo.android.package).toBe('com.sanich123.runningapp.dev');
    expect(expo.plugins).toContainEqual(['expo-router', { origin: 'https://stage-web.runich-app.ru' }]);
  });

  it('uses the production app identity and router origin outside development and stage builds', () => {
    delete process.env.APP_VARIANT;
    process.env.EXPO_PUBLIC_BASE_URL = 'https://runich-app.ru';

    const { expo } = loadAppConfig();

    expect(expo.name).toBe('Runich');
    expect(expo.scheme).toBe('runich');
    expect(expo.ios.bundleIdentifier).toBe('com.sanich123.runich');
    expect(expo.android.package).toBe('com.sanich123.runningapp');
    expect(expo.plugins).toContainEqual(['expo-router', { origin: 'https://runich-app.ru' }]);
  });
});
