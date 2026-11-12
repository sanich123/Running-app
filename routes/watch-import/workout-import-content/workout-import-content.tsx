import { Platform, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { renderHealthConnectLinks } from '../health-connect-link/utils';
import { WORKOUT_IMPORT_COPY } from '../workout-import/const';
import DiagnosticsCard from '../workout-import/diagnostics-card/diagnostics-card';
import { useWorkoutImport } from '../workout-import/use-workout-import';
import ConnectionControls from './connection-controls/connection-controls';
import ProviderStatus from './provider-status/provider-status';
import WorkoutList from './workout-list/workout-list';

export default function WorkoutImportContent({
  autoSync = false,
  showIntro = true,
}: {
  autoSync?: boolean;
  showIntro?: boolean;
}) {
  const { colors } = useTheme();
  const isIOS = Platform.OS === 'ios';
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

  return (
    <View style={styles.items}>
      {showIntro && (
        <Text variant="bodyMedium" style={styles.intro}>
          {renderHealthConnectLinks(isIOS ? copy.iosIntro : copy.intro, colors.primary)}
        </Text>
      )}

      {isLoading && !availability ? (
        <ActivityIndicator testID="health-connect-loading" style={styles.loader} />
      ) : availability !== null && availability !== 'available' ? (
        <ProviderStatus
          availability={availability}
          copy={copy}
          isIOS={isIOS}
          isLoading={isLoading}
          needsHealthConnectApp={needsHealthConnectApp}
          openHealthConnectInstallPage={openHealthConnectInstallPage}
          refreshHealthConnection={refreshHealthConnection}
        />
      ) : (
        <>
          <ConnectionControls
            autoSyncEnabled={autoSyncEnabled}
            connect={connect}
            copy={copy}
            isAutoSyncing={isAutoSyncing}
            isConnected={isConnected}
            isIOS={isIOS}
            isLoading={isLoading}
            isReading={isReading}
            setAutoSyncEnabled={setAutoSyncEnabled}
            syncLatestWorkouts={syncLatestWorkouts}
          />

          {error && (
            <Text style={[styles.message, { color: colors.error }]}>
              {renderHealthConnectLinks(error, colors.primary)}
            </Text>
          )}
          {importResult && <Text style={[styles.message, { color: colors.primary }]}>{importResult}</Text>}

          <WorkoutList
            copy={copy}
            hiddenWorkouts={hiddenWorkouts}
            hideWorkout={hideWorkout}
            importSelected={importSelected}
            isConnected={isConnected}
            isImporting={isImporting}
            isIOS={isIOS}
            isReading={isReading}
            isRussian={isRussian}
            restoreWorkout={restoreWorkout}
            selectedIds={selectedIds}
            selectedWorkoutsCount={selectedWorkouts.length}
            toggleWorkout={toggleWorkout}
            workouts={workouts}
          />
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  items: { gap: 10 },
  intro: { lineHeight: 22 },
  message: { marginTop: 8 },
  loader: { marginVertical: 24 },
});
