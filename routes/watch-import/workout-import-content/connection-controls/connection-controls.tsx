import { StyleSheet, View } from 'react-native';
import { Button, Card, Switch, Text, useTheme } from 'react-native-paper';
import { renderHealthConnectLinks } from '../../health-connect-link/utils';
import type { ConnectionControlsProps } from './types';

export default function ConnectionControls({
  autoSyncEnabled,
  connect,
  copy,
  isAutoSyncing,
  isConnected,
  isIOS,
  isLoading,
  isReading,
  setAutoSyncEnabled,
  syncLatestWorkouts,
}: ConnectionControlsProps) {
  const { colors } = useTheme();

  return (
    <>
      {!isConnected && (
        <Button
          testID="health-connect-connect"
          mode="contained"
          onPress={connect}
          loading={isLoading}
          style={styles.button}>
          {isIOS ? copy.iosConnect : copy.connect}
        </Button>
      )}

      {isConnected && (
        <Card style={styles.statusCard}>
          <Card.Content>
            <Text variant="titleSmall" style={{ color: colors.primary }}>
              {renderHealthConnectLinks(isIOS ? copy.iosConnected : copy.connected, colors.primary)}
            </Text>
            <View style={styles.switchRow}>
              <View style={styles.copy}>
                <Text variant="titleSmall">{copy.autoSync.title}</Text>
              </View>
              <Switch
                value={autoSyncEnabled}
                onValueChange={(value) => void setAutoSyncEnabled(value)}
                accessibilityLabel={copy.autoSync.title}
                testID="health-connect-auto-sync-switch"
              />
            </View>
            {isIOS && (
              <Button
                testID="health-connect-request-permissions"
                compact
                mode="outlined"
                onPress={connect}
                loading={isLoading}
                style={styles.permissionButton}>
                {copy.iosRequestPermissions}
              </Button>
            )}
          </Card.Content>
        </Card>
      )}

      {isConnected && (
        <Button
          testID="health-connect-refresh"
          mode="outlined"
          onPress={() => void syncLatestWorkouts(true)}
          loading={isReading || isAutoSyncing}
          style={styles.button}>
          {copy.refresh}
        </Button>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  statusCard: { marginTop: 2, borderColor: '#4caf50', borderWidth: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  copy: { flex: 1, gap: 2 },
  permissionButton: { alignSelf: 'flex-start', marginTop: 12 },
  button: { marginTop: 6 },
});
