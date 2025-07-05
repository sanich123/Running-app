import { JSX } from 'react';
import { BaseToast, BaseToastProps, ErrorToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props: JSX.IntrinsicAttributes & BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#34a853',
        backgroundColor: '#34a853',
        minHeight: 40,
        height: undefined,
        paddingBottom: 16,
        paddingTop: 16,
      }}
      text2Style={{
        color: '#ffffff',
        fontSize: 14,
      }}
      text2NumberOfLines={0}
    />
  ),
  info: (props: JSX.IntrinsicAttributes & BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#4285f4',
        backgroundColor: '#4285f4',
        minHeight: 40,
        height: undefined,
        paddingBottom: 16,
        paddingTop: 16,
      }}
      text2Style={{
        color: '#ffffff',
        fontSize: 14,
      }}
      text2NumberOfLines={0}
    />
  ),
  error: (props: JSX.IntrinsicAttributes & BaseToastProps) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#ea4335',
        backgroundColor: '#ea4335',
        minHeight: 40,
        height: undefined,
        paddingBottom: 16,
        paddingTop: 16,
      }}
      text2Style={{
        color: '#ffffff',
        fontSize: 14,
      }}
      text2NumberOfLines={0}
    />
  ),
};
