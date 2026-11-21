interface NativeAuthResult {
  accessToken?: string;
  code?: string;
  deviceId?: string;
  codeVerifier?: string;
  state?: string;
  redirectUri?: string;
  cancelled: boolean;
}

interface NativeAuthModule {
  loginWithYandex: () => Promise<NativeAuthResult>;
  loginWithVk: () => Promise<NativeAuthResult>;
}

interface NativeAuthApi {
  loginWithYandexNative: () => Promise<string | null>;
  loginWithVkNative: () => Promise<{
    code: string;
    deviceId: string;
    codeVerifier: string;
    state: string;
    redirectUri?: string;
  } | null>;
}

function loadNativeAuthModule(nativeModule: NativeAuthModule | null, platformOS = 'android') {
  const requireOptionalNativeModule = jest.fn(() => nativeModule);
  let nativeAuth: NativeAuthApi | undefined;

  jest.doMock('expo', () => ({ requireOptionalNativeModule }));
  jest.doMock('react-native', () => ({ Platform: { OS: platformOS } }));
  jest.isolateModules(() => {
    nativeAuth = require('./RunichAuth') as NativeAuthApi;
  });
  jest.dontMock('expo');
  jest.dontMock('react-native');

  if (!nativeAuth) throw new Error('Failed to load native auth module.');

  return { nativeAuth, requireOptionalNativeModule };
}

describe('RunichAuth', () => {
  afterEach(() => {
    jest.dontMock('expo');
    jest.dontMock('react-native');
    jest.resetModules();
  });

  it('returns a Yandex access token from the Android SDK', async () => {
    const loginWithYandex = jest.fn<Promise<NativeAuthResult>, []>().mockResolvedValue({
      accessToken: 'yandex-token',
      cancelled: false,
    });
    const { nativeAuth, requireOptionalNativeModule } = loadNativeAuthModule({
      loginWithYandex,
      loginWithVk: jest.fn(),
    });

    await expect(nativeAuth.loginWithYandexNative()).resolves.toBe('yandex-token');
    expect(requireOptionalNativeModule).toHaveBeenCalledWith('RunichAuth');
    expect(loginWithYandex).toHaveBeenCalledTimes(1);
  });

  it('returns null when Yandex login is cancelled', async () => {
    const { nativeAuth } = loadNativeAuthModule({
      loginWithYandex: jest.fn().mockResolvedValue({ cancelled: true }),
      loginWithVk: jest.fn(),
    });

    await expect(nativeAuth.loginWithYandexNative()).resolves.toBeNull();
  });

  it('rejects a Yandex result without an access token', async () => {
    const { nativeAuth } = loadNativeAuthModule({
      loginWithYandex: jest.fn().mockResolvedValue({ cancelled: false }),
      loginWithVk: jest.fn(),
    });

    await expect(nativeAuth.loginWithYandexNative()).rejects.toThrow('The Yandex SDK did not return an access token.');
  });

  it('returns the VK authorization code and PKCE values', async () => {
    const loginWithVk = jest.fn<Promise<NativeAuthResult>, []>().mockResolvedValue({
      code: 'authorization-code',
      deviceId: 'device-id',
      codeVerifier: 'code-verifier',
      state: 'vk-state',
      redirectUri: 'vk123://id.vk.ru/blank.html',
      cancelled: false,
    });
    const { nativeAuth } = loadNativeAuthModule({ loginWithYandex: jest.fn(), loginWithVk });

    await expect(nativeAuth.loginWithVkNative()).resolves.toEqual({
      code: 'authorization-code',
      deviceId: 'device-id',
      codeVerifier: 'code-verifier',
      state: 'vk-state',
      redirectUri: 'vk123://id.vk.ru/blank.html',
    });
    expect(loginWithVk).toHaveBeenCalledTimes(1);
  });

  it('returns null when VK login is cancelled', async () => {
    const { nativeAuth } = loadNativeAuthModule({
      loginWithYandex: jest.fn(),
      loginWithVk: jest.fn().mockResolvedValue({ cancelled: true }),
    });

    await expect(nativeAuth.loginWithVkNative()).resolves.toBeNull();
  });

  it.each([
    [{ deviceId: 'device-id', codeVerifier: 'code-verifier' }],
    [{ code: 'authorization-code', codeVerifier: 'code-verifier' }],
    [{ code: 'authorization-code', deviceId: 'device-id' }],
  ])('rejects incomplete VK authorization data: %o', async (authorization) => {
    const { nativeAuth } = loadNativeAuthModule({
      loginWithYandex: jest.fn(),
      loginWithVk: jest.fn().mockResolvedValue({ ...authorization, cancelled: false }),
    });

    await expect(nativeAuth.loginWithVkNative()).rejects.toThrow('The VK SDK did not return an authorization code.');
  });

  it('reports when the native module is unavailable', async () => {
    const { nativeAuth, requireOptionalNativeModule } = loadNativeAuthModule(null);

    await expect(nativeAuth.loginWithYandexNative()).rejects.toThrow(
      'Native social sign-in is not available in this build.',
    );
    await expect(nativeAuth.loginWithVkNative()).rejects.toThrow(
      'Native social sign-in is not available in this build.',
    );
    expect(requireOptionalNativeModule).toHaveBeenCalledTimes(1);
  });

  it.each(['ios', 'android'])('loads the native module on %s', async (platformOS) => {
    const loginWithYandex = jest.fn().mockResolvedValue({ accessToken: 'yandex-token', cancelled: false });
    const { nativeAuth, requireOptionalNativeModule } = loadNativeAuthModule(
      { loginWithYandex, loginWithVk: jest.fn() },
      platformOS,
    );

    await expect(nativeAuth.loginWithYandexNative()).resolves.toBe('yandex-token');
    expect(requireOptionalNativeModule).toHaveBeenCalledWith('RunichAuth');
    expect(loginWithYandex).toHaveBeenCalledTimes(1);
  });

  it('does not load the native module on web', async () => {
    const { nativeAuth, requireOptionalNativeModule } = loadNativeAuthModule(null, 'web');

    await expect(nativeAuth.loginWithYandexNative()).rejects.toThrow(
      'Native social sign-in is not available in this build.',
    );
    expect(requireOptionalNativeModule).not.toHaveBeenCalled();
  });
});
