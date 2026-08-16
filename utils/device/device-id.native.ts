import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'runich-device' });
const key = 'device-id';
const existing = storage.getString(key);
const created = existing ?? `native-${Date.now()}-${Math.random().toString(36).slice(2)}`;
if (!existing) storage.set(key, created);

export const deviceId = created;
export const deviceName = 'Runich mobile app';
export const platform = 'mobile';
export const deviceMetadata = {
  model: Device.modelName ?? undefined,
  manufacturer: Device.manufacturer ?? undefined,
  osName: Device.osName ?? undefined,
  osVersion: Device.osVersion ?? undefined,
  deviceType: Device.deviceType?.toString(),
  appVersion: Constants.expoConfig?.version ?? undefined,
  appBuild: Constants.expoConfig?.android?.versionCode?.toString() ?? Constants.expoConfig?.ios?.buildNumber,
};
