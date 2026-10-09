import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ActivityIndicator, Button, Card, Checkbox, Divider, Text, useTheme } from 'react-native-paper';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import {
  HEALTH_CONNECT_GUIDE_URL,
  HEALTH_SYNC_APP_GALLERY_URL,
  HEALTH_SYNC_FAQ_URL,
  HEALTH_SYNC_GUIDE_URL,
} from './const';
import { WORKOUT_IMPORT_COPY } from './workout-import/const';
import {
  formatConnectionDiagnostics,
  formatHealthPermissionsDiagnostics,
  formatImportSelectedLabel,
  formatReadDiagnostics,
  formatUploadDiagnostics,
  formatWorkoutCountNotice,
  formatWorkoutDiagnostics,
  getBooleanLabel,
  getWorkoutId,
} from './workout-import/helpers';
import { useWorkoutImport } from './workout-import/use-workout-import';

export default function WorkoutImportGuidePage() {
  const { colors } = useTheme();
  const {
    availability,
    connect,
    error,
    healthPermissions,
    healthStatusErrorCode,
    importResult,
    importSelected,
    isAutoSyncing,
    isConnected,
    isImporting,
    isLoading,
    isReading,
    isRussian,
    needsHealthConnectApp,
    openExternalLink,
    openHealthConnectInstallPage,
    readDiagnostics,
    refreshHealthConnection,
    selectedIds,
    selectedWorkouts,
    syncLatestWorkouts,
    toggleWorkout,
    uploadDiagnostics,
    userId,
    workouts,
  } = useWorkoutImport();
  const copy = WORKOUT_IMPORT_COPY[isRussian ? 'ru' : 'en'];
  const diagnosticCopy = copy.diagnostics;

  const diagnosticsCard = (
    <Card style={styles.diagnosticCard}>
      <Card.Content>
        <Text variant="titleMedium">{diagnosticCopy.title}</Text>
        <Text variant="bodySmall" style={styles.diagnosticText}>
          {formatConnectionDiagnostics('android', availability, isConnected, Boolean(userId), isRussian)}
        </Text>
        <Text variant="bodySmall" style={styles.diagnosticText}>
          {diagnosticCopy.requiredPermissions}: {getBooleanLabel(healthPermissions?.granted, isRussian)}
        </Text>
        <Text variant="bodySmall" style={styles.diagnosticText}>
          {diagnosticCopy.permissions}: {formatHealthPermissionsDiagnostics(healthPermissions, isRussian)}
        </Text>
        {healthStatusErrorCode && (
          <Text variant="bodySmall" style={styles.diagnosticText}>
            {diagnosticCopy.statusError}: {healthStatusErrorCode}
          </Text>
        )}

        <Text variant="bodySmall" style={styles.diagnosticText}>
          {formatReadDiagnostics(readDiagnostics, isRussian)}
        </Text>
        {isReading && <ActivityIndicator size="small" style={styles.readingIndicator} />}

        {workouts.slice(0, 50).map((workout, index) => (
          <Text key={getWorkoutId(workout)} variant="bodySmall" style={styles.diagnosticWorkout}>
            {formatWorkoutDiagnostics(workout, index, isRussian)}
          </Text>
        ))}
        {workouts.length > 50 && (
          <Text variant="bodySmall" style={styles.diagnosticText}>
            {formatWorkoutCountNotice(workouts.length, isRussian)}
          </Text>
        )}

        <Text variant="bodySmall" style={styles.diagnosticText}>
          {formatUploadDiagnostics(uploadDiagnostics, isRussian)}
        </Text>
        <Text variant="bodySmall" style={styles.diagnosticText}>
          {diagnosticCopy.note}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <>
      <Stack.Screen options={{ title: copy.title }} />
      <CrossPlatformLayout scrollViewEnabled outerStyles={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          {copy.title}
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          {copy.flow}
        </Text>

        {diagnosticsCard}

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">{copy.appsTitle}</Text>
            <Text variant="bodySmall" style={[styles.guideIntro, { color: colors.onSurfaceVariant }]}>
              {copy.appsIntro}
            </Text>
            <Button compact mode="outlined" onPress={() => void openExternalLink(HEALTH_SYNC_APP_GALLERY_URL)}>
              {copy.healthSyncInstall}
            </Button>
            <Button compact mode="text" onPress={() => void openExternalLink(HEALTH_SYNC_FAQ_URL)}>
              {copy.healthSyncLicense}
            </Button>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 6 }}>
              {copy.healthSyncLicenseNote}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.noteCard}>
          <Card.Content>
            <Text variant="titleSmall">{copy.gpsTitle}</Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 4 }}>
              {copy.gpsDescription}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleSmall">{copy.healthSyncGuideTitle}</Text>
            <Button compact mode="text" onPress={() => void openExternalLink(HEALTH_SYNC_GUIDE_URL)}>
              {copy.healthSyncDataTypes}
            </Button>
            <Button compact mode="text" onPress={() => void openExternalLink(HEALTH_SYNC_FAQ_URL)}>
              {copy.healthSyncHelp}
            </Button>
            <Button
              compact
              mode="text"
              onPress={() => void openExternalLink(`${HEALTH_CONNECT_GUIDE_URL}?hl=${isRussian ? 'ru' : 'en'}`)}>
              {copy.healthConnectGuide}
            </Button>
          </Card.Content>
        </Card>

        {copy.steps.map((step) => (
          <Card key={step.number} style={styles.card}>
            <Card.Content>
              <View style={styles.stepRow}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primaryContainer }]}>
                  <Text variant="titleMedium" style={{ color: colors.primary }}>
                    {step.number}
                  </Text>
                </View>
                <View style={styles.stepCopy}>
                  <Text variant="titleMedium">{step.title}</Text>
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                    {step.description}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleSmall">{copy.missingWorkoutTitle}</Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 4 }}>
              {copy.missingWorkout}
            </Text>
          </Card.Content>
        </Card>

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
            ) : workouts.length === 0 && isConnected ? (
              <Text style={[styles.message, { color: colors.onSurfaceVariant }]}>{copy.noWorkouts}</Text>
            ) : (
              workouts.map((workout, index) => {
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
                      {index < workouts.length - 1 && <Divider style={styles.divider} />}
                    </Card.Content>
                  </Card>
                );
              })
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
      </CrossPlatformLayout>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, gap: 10 },
  title: { marginBottom: 2 },
  card: { marginTop: 2 },
  statusCard: { marginTop: 2, borderColor: '#4caf50', borderWidth: 1 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNumber: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepCopy: { flex: 1, gap: 4 },
  guideIntro: { marginTop: 4 },
  noteCard: { marginTop: 2, borderColor: '#d58a21', borderWidth: 1 },
  diagnosticCard: { marginTop: 8, borderColor: '#607d8b', borderWidth: 1 },
  diagnosticText: { marginTop: 6, color: '#607d8b' },
  diagnosticWorkout: { marginTop: 5 },
  readingIndicator: { alignSelf: 'flex-start', marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  copy: { flex: 1, gap: 2 },
  divider: { marginTop: 10 },
  button: { marginTop: 6 },
  message: { marginTop: 8 },
  loader: { marginVertical: 24 },
});
