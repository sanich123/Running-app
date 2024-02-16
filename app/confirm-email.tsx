import { View, Text, Platform } from 'react-native'
import React, { useEffect } from 'react'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser';
    import * as Linking from 'expo-linking';
import { createSessionFromUrl } from '@A/supabase/storage/sign-in';
export default function confirmationEmailPage() {
    if (Platform.OS === 'web') {
      WebBrowser.maybeCompleteAuthSession();
    }
  const url = Linking.useURL();

  if (url) {
    console.log(url);
    createSessionFromUrl(url);
  }
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text>Спасибо, Ваш Email подтвержден! Теперь можете залогиниться под этой электронной почтой</Text>
        </View>
  )
}
