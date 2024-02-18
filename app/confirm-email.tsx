import { createSessionFromUrl } from '@A/supabase/storage/sign-in';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Device from 'expo-device';
import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { View, Text, Platform } from 'react-native';

export default function ConfirmationEmailPage() {
  const { push } = useRouter();
  const [errorCode, setErrorCode] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');

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
          setErrorCode(errorCode);
          throw new Error(errorCode);
        }
        const { access_token, refresh_token } = params;
        setAccessToken(access_token);
        setRefreshToken(refresh_token);
        if (!access_token) return;
        const redirectUrl = Linking.createURL('com.supabase://sign-in', {
          queryParams: { access_token, refresh_token },
        });
        setRedirectUrl(redirectUrl);
        Linking.openURL(redirectUrl);
      }
    }
  }, [url]);

  return (
    <>
      <Stack.Screen options={{ title: 'confirm-email', headerShown: false }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Спасибо, Ваш Email подтвержден!</Text>
        <Text>{url}</Text>
        <Text>{`errorCode: ${errorCode}`}</Text>
        <Text>{`accessToken: ${accessToken}`}</Text>
        <Text>{`refreshToken: ${refreshToken}`}</Text>
        <Text>{`redirectUrl: ${redirectUrl}`}</Text>
      </View>
    </>
  );
}
