//@ts-ignore
import Toast from 'react-native-root-toast';

export enum ToastDuration {
  long = 'long',
  short = 'short',
}

export function showCrossPlatformToast(message: string, duration: ToastDuration = ToastDuration.short) {
  Toast.show(message, { duration: duration === ToastDuration.long ? Toast.durations.LONG : Toast.durations.SHORT });
}
