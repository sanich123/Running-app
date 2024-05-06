import { createSessionFromUrl } from '@A/supabase/storage/sign-in';
import { useAppSelector } from '@R/typed-hooks';
import { useURL } from 'expo-linking';
import { Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { View, Text, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

import { RESET_PASSWORD } from './const';

export default function SignInResetPassword() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);

  if (Platform.OS === 'web') {
    WebBrowser.maybeCompleteAuthSession();
  }
  const url = useURL();

  useEffect(() => {
    if (url) {
      createSessionFromUrl(url);
    }
  }, [url]);

  return (
    <>
      {!process.env.IS_TESTING && <Stack.Screen options={{ title: 'reset-password', headerShown: false }} />}
      <View
        style={{
          backgroundColor: colors.background,
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 10,
        }}>
        <Text>{RESET_PASSWORD[language].redirectToResettingPage}</Text>
      </View>
    </>
  );
}
