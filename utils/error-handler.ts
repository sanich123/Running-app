import { ToastAndroid } from 'react-native';

export function errorHandler(err: unknown) {
  if (err instanceof Error) {
    ToastAndroid.show(err.message, ToastAndroid.SHORT);
  }
}
