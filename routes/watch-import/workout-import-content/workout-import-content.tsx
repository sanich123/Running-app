import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Checkbox, Switch, Text, useTheme } from 'react-native-paper';
import { renderHealthConnectLinks } from '../health-connect-link/utils';
import { WORKOUT_IMPORT_COPY } from '../workout-import/const';
import DiagnosticsCard from '../workout-import/diagnostics-card/diagnostics-card';
import { formatImportSelectedLabel, getWorkoutId } from '../workout-import/helpers';
import { useWorkoutImport } from '../workout-import/use-workout-import';

export default function WorkoutImportContent({ autoSync = false }: { autoSync?: boolean }) {
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
  } = useWorkoutImport({ autoSync });
  const copy = WORKOUT_IMPORT_COPY[isRussian ? 'ru' : 'en'];
  const [showHiddenWorkouts, setShowHiddenWorkouts] = useState(false);

  return (
    <View style={styles.items}>
      <Text variant="bodyMedium" style={styles.intro}>
        {renderHealthConnectLinks(copy.intro, colors.primary)}
      </Text>

      {isLoading && !availability ? (
        <ActivityIndicator testID="health-connect-loading" style={styles.loader} />
      ) : availability === 'provider-update-required' ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium">{renderHealthConnectLinks(copy.updateProvider, colors.primary)}</Text>
            <Button
              testID="health-connect-open-provider"
              compact
              mode="outlined"
              onPress={() => void openHealthConnectInstallPage()}>
              {copy.openGooglePlay}
            </Button>
            <Button
              testID="health-connect-retry"
              compact
              mode="text"
              loading={isLoading}
              onPress={() => void refreshHealthConnection()}>
              {copy.retry}
            </Button>
          </Card.Content>
        </Card>
      ) : availability === 'provider-not-available' ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium">{renderHealthConnectLinks(copy.providerUnavailable, colors.primary)}</Text>
            {needsHealthConnectApp && (
              <Button
                testID="health-connect-open-provider"
                compact
                mode="outlined"
                onPress={() => void openHealthConnectInstallPage()}>
                {copy.openHealthConnect}
              </Button>
            )}
            <Button
              testID="health-connect-retry"
              compact
              mode="text"
              loading={isLoading}
              onPress={() => void refreshHealthConnection()}>
              {copy.retry}
            </Button>
          </Card.Content>
        </Card>
      ) : availability === 'not-supported' ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium">{renderHealthConnectLinks(copy.minimumAndroid, colors.primary)}</Text>
          </Card.Content>
        </Card>
      ) : (
        <>
          {!isConnected && (
            <Button
              testID="health-connect-connect"
              mode="contained"
              onPress={connect}
              loading={isLoading}
              style={styles.button}>
              {copy.connect}
            </Button>
          )}

          {isConnected && (
            <Card style={styles.statusCard}>
              <Card.Content>
                <Text variant="titleSmall" style={{ color: colors.primary }}>
                  {copy.connected}
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

          {error && (
            <Text style={[styles.message, { color: colors.error }]}>
              {renderHealthConnectLinks(error, colors.primary)}
            </Text>
          )}
          {importResult && <Text style={[styles.message, { color: colors.primary }]}>{importResult}</Text>}

          {isReading ? (
            <ActivityIndicator testID="health-connect-loading" style={styles.loader} />
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
                      <Checkbox
                        testID={`health-connect-select-workout-${id}`}
                        status={checked ? 'checked' : 'unchecked'}
                        onPress={() => toggleWorkout(workout)}
                      />
                      <View style={styles.copy}>
                        <Text variant="titleMedium">{workout.title || workout.sport}</Text>
                        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                          {new Date(workout.date).toLocaleString(isRussian ? 'ru-RU' : 'en-US')} ·{' '}
                          {Math.round(workout.distance)} m · {Math.round(workout.duration / 60_000)} min
                        </Text>
                      </View>
                    </View>
                    <Button
                      testID={`health-connect-hide-workout-${id}`}
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
                testID="health-connect-hidden-workouts-toggle"
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
                          testID={`health-connect-restore-workout-${id}`}
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
              testID="health-connect-import-selected"
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
    </View>
  );
}

const styles = StyleSheet.create({
  items: { gap: 10 },
  intro: { lineHeight: 22 },
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
