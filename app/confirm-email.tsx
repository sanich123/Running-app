import { createSessionFromUrl } from '@A/supabase/storage/sign-in';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Device from 'expo-device';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { View, Text, Platform } from 'react-native';

export default function ConfirmationEmailPage() {
  const { push } = useRouter();
  if (Platform.OS === 'web') {
    WebBrowser.maybeCompleteAuthSession();
  }
  const url = Linking.useURL();

  useEffect(() => {
    if (url) {
      if (Device.deviceType === Device.DeviceType.DESKTOP) {
        createSessionFromUrl(url);
        push('/');
      } else {
        const { params, errorCode } = QueryParams.getQueryParams(url);
        if (errorCode) {
          throw new Error(errorCode);
        }
        const { access_token, refresh_token } = params;
        if (!access_token) return;
        const redirectUrl = Linking.createURL('com.supabase://sign-in', {
          queryParams: { access_token, refresh_token },
        });
        Linking.openURL(redirectUrl);
      }
    }
  }, [url]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{`Спасибо, Ваш Email подтвержден! Теперь можете залогиниться под этой электронной почтой, url: ${url}`}</Text>
    </View>
  );
}
