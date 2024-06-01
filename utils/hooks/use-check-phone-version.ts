import { ToastDuration, showCrossPlatformToast } from '@U/custom-toast';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function useCheckPhoneVersion() {
  const isEarlyAndroid = Platform.OS === 'android' && Platform.Version < 31;
  const isEarylIos = Platform.OS === 'ios' && parseInt(Platform.Version, 10) <= 13;
  const isOldVersion = isEarlyAndroid || isEarylIos;

  useEffect(() => {
    if (isOldVersion) {
      if (Platform.OS !== 'web') {
        showCrossPlatformToast('You have an old version of the phone', ToastDuration.long);
      }
    }
  }, []);
  return { isOldVersion };
}
