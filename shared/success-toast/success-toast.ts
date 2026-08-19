import Toast from 'react-native-toast-message';

export function successToast(message: string) {
  return Toast.show({ type: 'success', text2: message });
}
