import { Button, Card, Text, useTheme } from 'react-native-paper';
import { renderHealthConnectLinks } from '../../health-connect-link/utils';
import type { ProviderStatusProps } from './types';

export default function ProviderStatus({
  availability,
  copy,
  isIOS,
  isLoading,
  needsHealthConnectApp,
  openHealthConnectInstallPage,
  refreshHealthConnection,
}: ProviderStatusProps) {
  const { colors } = useTheme();

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="bodyMedium">
          {renderHealthConnectLinks(
            availability === 'provider-update-required'
              ? isIOS
                ? copy.iosUnavailable
                : copy.updateProvider
              : availability === 'provider-not-available'
                ? isIOS
                  ? copy.iosUnavailable
                  : copy.providerUnavailable
                : isIOS
                  ? copy.iosUnavailable
                  : copy.minimumAndroid,
            colors.primary,
          )}
        </Text>
        {availability === 'provider-update-required' && !isIOS && (
          <Button
            testID="health-connect-open-provider"
            compact
            mode="outlined"
            onPress={() => void openHealthConnectInstallPage()}>
            {copy.openGooglePlay}
          </Button>
        )}
        {availability === 'provider-not-available' && !isIOS && needsHealthConnectApp && (
          <Button
            testID="health-connect-open-provider"
            compact
            mode="outlined"
            onPress={() => void openHealthConnectInstallPage()}>
            {copy.openHealthConnect}
          </Button>
        )}
        {availability !== 'not-supported' && (
          <Button
            testID="health-connect-retry"
            compact
            mode="text"
            loading={isLoading}
            onPress={() => void refreshHealthConnection()}>
            {copy.retry}
          </Button>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = {
  card: { marginTop: 2 },
};
