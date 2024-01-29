import { Platform, ToastAndroid } from 'react-native';
//@ts-ignore
import Toast from 'react-native-root-toast';

export enum ToastDuration {
  long = 'long',
  short = 'short',
}

export function showCrossPlatformToast(message: string, duration: ToastDuration) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, duration === ToastDuration.long ? ToastAndroid.LONG : ToastAndroid.SHORT);
  } else {
    Toast.show(message, { duration: duration === ToastDuration.long ? Toast.durations.LONG : Toast.durations.SHORT });
  }
}
