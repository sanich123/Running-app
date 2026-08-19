import * as Linking from 'expo-linking';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Button, Icon, Text, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import { MOCK_MARKET_URLS } from './const';
import { getMarketUrl } from './utils';

export default function UpdateAppPage() {
  const { colors } = useTheme();

  const openMarket = async () => {
    try {
      await Linking.openURL(getMarketUrl() ?? MOCK_MARKET_URLS.default);
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
            Требуется обновление
          </Text>
          <Text variant="bodyLarge" style={[styles.description, { color: colors.onSurfaceVariant }]}>
            Версия приложения устарела. Обновите приложение, чтобы продолжить работу.
          </Text>
          <Button
            mode="contained"
            onPress={() => void openMarket()}
            style={styles.button}
            contentStyle={styles.buttonContent}>
            Перейти в маркет
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
