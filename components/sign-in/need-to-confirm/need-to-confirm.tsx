import { useAppSelector } from '@R/typed-hooks';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { CHECK_EMAIL } from './const';

export default function SignInNeedToConfirmEmail() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);

  return (
    <>
      {!process.env.IS_TESTING && (
        <Stack.Screen options={{ title: 'confirm-email-notification', headerShown: false }} />
      )}
      <View
        style={{
          backgroundColor: colors.background,
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 10,
        }}>
        <Text variant="headlineSmall" style={{ textAlign: 'center' }}>
          {CHECK_EMAIL[language].mailHasBeenSent}
        </Text>
        <Text variant="bodyLarge" style={{ textAlign: 'center', marginTop: 20 }}>
          {CHECK_EMAIL[language].needToCheckEmail}
        </Text>
      </View>
    </>
  );
}
