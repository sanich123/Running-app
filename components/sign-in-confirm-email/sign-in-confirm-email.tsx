import { createSessionFromUrl } from '@A/supabase/storage/sign-in';
import { useAppSelector } from '@R/typed-hooks';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Device from 'expo-device';
import * as Linking from 'expo-linking';
import { Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { View, Text, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

import { CONFIRM_EMAIL } from './const';

export default function SignInConfirmEmail() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);

  if (Platform.OS === 'web') {
    WebBrowser.maybeCompleteAuthSession();
  }
  const url = Linking.useURL();

  useEffect(() => {
    if (url) {
      if (Device.deviceType === Device.DeviceType.DESKTOP) {
        createSessionFromUrl(url);
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
    <>
      {!process.env.IS_TESTING && <Stack.Screen options={{ title: 'confirm-email', headerShown: false }} />}
      <View
        style={{
          backgroundColor: colors.background,
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 10,
        }}>
        <Text>{CONFIRM_EMAIL[language].emailConfirmed}</Text>
      </View>
    </>
  );
}
