import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

interface NativeAuthResult {
  accessToken?: string;
  code?: string;
  deviceId?: string;
  codeVerifier?: string;
  cancelled: boolean;
}

interface RunichAuthNativeModule {
  loginWithYandex(): Promise<NativeAuthResult>;
  loginWithVk(): Promise<NativeAuthResult>;
}

const nativeModule =
  Platform.OS === 'android' ? requireOptionalNativeModule<RunichAuthNativeModule>('RunichAuth') : null;

async function getProviderResult(provider: 'yandex' | 'vk') {
  if (!nativeModule) throw new Error('Native social sign-in is not available in this build.');
  const result = provider === 'yandex' ? await nativeModule.loginWithYandex() : await nativeModule.loginWithVk();
  if (result.cancelled) return null;
  if (provider === 'yandex' && !result.accessToken) {
    throw new Error('The Yandex SDK did not return an access token.');
  }
  if (provider === 'vk' && (!result.code || !result.deviceId || !result.codeVerifier)) {
    throw new Error('The VK SDK did not return an authorization code.');
  }
  return result;
}

export async function loginWithYandexNative() {
  const result = await getProviderResult('yandex');
  return result?.accessToken ?? null;
}

export async function loginWithVkNative() {
  const result = await getProviderResult('vk');
  if (!result) return null;
  return { code: result.code!, deviceId: result.deviceId!, codeVerifier: result.codeVerifier! };
}
