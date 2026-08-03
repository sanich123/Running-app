import Toast from 'react-native-toast-message';

export enum ToastDuration {
  long = 'long',
  short = 'short',
}

export function showCrossPlatformToast(message: string) {
  return Toast.show({ type: 'info', text2: message });
}
