import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ActivityIndicator, Button, Card, Checkbox, Switch, Text, useTheme } from 'react-native-paper';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import { WORKOUT_IMPORT_COPY } from './workout-import/const';
import DiagnosticsCard from './workout-import/diagnostics-card';
import { formatImportSelectedLabel, getWorkoutId } from './workout-import/helpers';
import { useWorkoutImport } from './workout-import/use-workout-import';

export default function WorkoutImportGuidePage() {
  const { colors } = useTheme();
  const {
    availability,
    autoSyncEnabled,
    connect,
    error,
    healthPermissions,
    healthStatusErrorCode,
    hiddenWorkouts,
    hideWorkout,
    importResult,
    importSelected,
    isAutoSyncing,
    isConnected,
    isImporting,
    isLoading,
    isReading,
    isRussian,
    needsHealthConnectApp,
    openHealthConnectInstallPage,
    readDiagnostics,
    refreshHealthConnection,
    restoreWorkout,
    selectedIds,
    selectedWorkouts,
    setAutoSyncEnabled,
    syncLatestWorkouts,
    toggleWorkout,
    uploadDiagnostics,
    userId,
    workouts,
  } = useWorkoutImport();
  const copy = WORKOUT_IMPORT_COPY[isRussian ? 'ru' : 'en'];
  const [showHiddenWorkouts, setShowHiddenWorkouts] = useState(false);

  return (
    <>
      <Stack.Screen options={{ title: copy.title }} />
      <CrossPlatformLayout scrollViewEnabled outerStyles={styles.content}>
        {isLoading && !availability ? (
          <ActivityIndicator style={styles.loader} />
        ) : availability === 'provider-update-required' ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="bodyMedium">{copy.updateProvider}</Text>
              <Button compact mode="outlined" onPress={() => void openHealthConnectInstallPage()}>
                {copy.openGooglePlay}
              </Button>
              <Button compact mode="text" loading={isLoading} onPress={() => void refreshHealthConnection()}>
                {copy.retry}
              </Button>
            </Card.Content>
          </Card>
        ) : availability === 'provider-not-available' ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="bodyMedium">{copy.providerUnavailable}</Text>
              {needsHealthConnectApp && (
                <Button compact mode="outlined" onPress={() => void openHealthConnectInstallPage()}>
                  {copy.openHealthConnect}
                </Button>
              )}
              <Button compact mode="text" loading={isLoading} onPress={() => void refreshHealthConnection()}>
                {copy.retry}
              </Button>
            </Card.Content>
          </Card>
        ) : availability === 'not-supported' ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="bodyMedium">{copy.minimumAndroid}</Text>
            </Card.Content>
          </Card>
        ) : (
          <>
            {!isConnected && (
              <Button mode="contained" onPress={connect} loading={isLoading} style={styles.button}>
                {copy.connect}
              </Button>
            )}

            {isConnected && (
              <Card style={styles.statusCard}>
                <Card.Content>
                  <Text variant="titleSmall" style={{ color: colors.primary }}>
                    {copy.connected}
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                    {copy.connectedDescription}
                  </Text>
                  <View style={styles.switchRow}>
                    <View style={styles.copy}>
                      <Text variant="titleSmall">{copy.autoSync.title}</Text>
                      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                        {copy.autoSync.description}
                      </Text>
                    </View>
                    <Switch
                      value={autoSyncEnabled}
                      onValueChange={(value) => void setAutoSyncEnabled(value)}
                      accessibilityLabel={copy.autoSync.title}
                      testID="health-connect-auto-sync-switch"
                    />
                  </View>
                </Card.Content>
              </Card>
            )}

            {isConnected && (
              <Button
                mode="outlined"
                onPress={() => void syncLatestWorkouts(true)}
                loading={isReading || isAutoSyncing}
                style={styles.button}>
                {copy.refresh}
              </Button>
            )}

            {error && <Text style={[styles.message, { color: colors.error }]}>{error}</Text>}
            {importResult && <Text style={[styles.message, { color: colors.primary }]}>{importResult}</Text>}

            {isReading ? (
              <ActivityIndicator style={styles.loader} />
            ) : workouts.length === 0 && hiddenWorkouts.length === 0 && isConnected ? (
              <Text style={[styles.message, { color: colors.onSurfaceVariant }]}>{copy.noWorkouts}</Text>
            ) : (
              workouts.map((workout) => {
                const id = getWorkoutId(workout);
                const checked = selectedIds.has(id);
                return (
                  <Card key={id} style={styles.card}>
                    <Card.Content>
                      <View style={styles.row}>
                        <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={() => toggleWorkout(workout)} />
                        <View style={styles.copy}>
                          <Text variant="titleMedium">{workout.title || workout.sport}</Text>
                          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                            {new Date(workout.date).toLocaleString(isRussian ? 'ru-RU' : 'en-US')} ·{' '}
                            {Math.round(workout.distance)} m · {Math.round(workout.duration / 60_000)} min
                          </Text>
                        </View>
                      </View>
                      <Button
                        compact
                        mode="text"
                        icon="eye-off-outline"
                        onPress={() => void hideWorkout(workout)}
                        accessibilityLabel={copy.hideFromImport}
                        style={styles.rowAction}>
                        {copy.hideFromImport}
                      </Button>
                    </Card.Content>
                  </Card>
                );
              })
            )}

            {hiddenWorkouts.length > 0 && (
              <>
                <Button
                  compact
                  mode="text"
                  icon={showHiddenWorkouts ? 'chevron-up' : 'chevron-down'}
                  onPress={() => setShowHiddenWorkouts((expanded) => !expanded)}
                  accessibilityState={{ expanded: showHiddenWorkouts }}>
                  {copy.hiddenWorkouts.replace('{count}', String(hiddenWorkouts.length))}
                </Button>
                {showHiddenWorkouts &&
                  hiddenWorkouts.map((workout) => {
                    const id = getWorkoutId(workout);
                    return (
                      <Card key={id} style={styles.card}>
                        <Card.Content>
                          <View style={styles.row}>
                            <View style={[styles.copy, styles.hiddenCopy]}>
                              <Text variant="titleMedium">{workout.title || workout.sport}</Text>
                              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                                {new Date(workout.date).toLocaleString(isRussian ? 'ru-RU' : 'en-US')} ·{' '}
                                {Math.round(workout.distance)} m · {Math.round(workout.duration / 60_000)} min
                              </Text>
                            </View>
                          </View>
                          <Button
                            compact
                            mode="text"
                            icon="eye-outline"
                            onPress={() => void restoreWorkout(workout)}
                            accessibilityLabel={copy.restoreToImport}
                            style={styles.rowAction}>
                            {copy.restoreToImport}
                          </Button>
                        </Card.Content>
                      </Card>
                    );
                  })}
              </>
            )}

            {isConnected && workouts.length > 0 && (
              <Button
                mode="contained"
                onPress={() => void importSelected()}
                loading={isImporting}
                disabled={isImporting || selectedWorkouts.length === 0}
                style={styles.button}>
                {formatImportSelectedLabel(selectedWorkouts.length, isRussian)}
              </Button>
            )}
          </>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleSmall">{copy.missingWorkoutTitle}</Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 4 }}>
              {copy.missingWorkout}
            </Text>
          </Card.Content>
        </Card>

        <DiagnosticsCard
          availability={availability}
          healthPermissions={healthPermissions}
          healthStatusErrorCode={healthStatusErrorCode}
          isConnected={isConnected}
          isReading={isReading}
          isRussian={isRussian}
          readDiagnostics={readDiagnostics}
          uploadDiagnostics={uploadDiagnostics}
          userId={userId}
          workouts={workouts}
        />
      </CrossPlatformLayout>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, gap: 10 },
  card: { marginTop: 2 },
  statusCard: { marginTop: 2, borderColor: '#4caf50', borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  copy: { flex: 1, gap: 2 },
  button: { marginTop: 6 },
  rowAction: { alignSelf: 'flex-end' },
  hiddenCopy: { paddingLeft: 12 },
  message: { marginTop: 8 },
  loader: { marginVertical: 24 },
});
