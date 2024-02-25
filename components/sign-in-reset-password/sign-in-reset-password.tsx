import { createSessionFromUrl } from '@A/supabase/storage/sign-in';
import * as Linking from 'expo-linking';
import { Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { View, Text, Platform } from 'react-native';

export default function SignInResetPassword() {
  if (Platform.OS === 'web') {
    WebBrowser.maybeCompleteAuthSession();
  }
  const url = Linking.useURL();

  useEffect(() => {
    if (url) {
      createSessionFromUrl(url);
    }
  }, [url]);

  return (
    <>
      <Stack.Screen options={{ title: 'reset-password', headerShown: false }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Авторизовываемся и редиректим на страницу смены пароля...</Text>
      </View>
    </>
  );
}
