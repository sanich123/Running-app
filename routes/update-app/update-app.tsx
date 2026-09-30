import * as Linking from 'expo-linking';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Button, Icon, Text, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import { UPDATE_APP_TEXT } from './const';

export default function UpdateAppPage() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = UPDATE_APP_TEXT[language];

  const openMarket = async () => {
    try {
      await Linking.openURL('https://rustore.ru/');
    } catch {
      // The market URL is mocked until the application stores are configured.
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: ROUTES.updateApp, headerShown: false }} />
      <CrossPlatformLayout edges={['top', 'bottom']}>
        <View style={styles.container}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}>
            <Icon source="cellphone-arrow-down" size={42} color={colors.primary} />
          </View>
          <Text variant="headlineSmall" style={styles.title}>
            {copy.title}
          </Text>
          <Text variant="bodyLarge" style={[styles.description, { color: colors.onSurfaceVariant }]}>
            {copy.description}
          </Text>
          <Button
            mode="contained"
            onPress={() => void openMarket()}
            style={styles.button}
            contentStyle={styles.buttonContent}>
            {copy.action}
          </Button>
        </View>
      </CrossPlatformLayout>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'center',
    maxWidth: 420,
    padding: 20,
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 34,
    height: 68,
    justifyContent: 'center',
    marginBottom: 20,
    width: 68,
  },
  title: { fontWeight: '800', textAlign: 'center' },
  description: { marginTop: 12, textAlign: 'center' },
  button: { marginTop: 24, width: '100%' },
  buttonContent: { minHeight: 48 },
});
