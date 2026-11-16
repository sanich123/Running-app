import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Checkbox, Icon, Text, useTheme } from 'react-native-paper';
import { renderHealthConnectLinks } from '../../health-connect-link/utils';
import { formatImportSelectedLabel, getWorkoutId } from '../../workout-import/helpers';
import type { WorkoutListProps } from './types';

export default function WorkoutList({
  copy,
  hiddenWorkouts,
  hideWorkout,
  importSelected,
  isConnected,
  isImporting,
  isIOS,
  isReading,
  isRussian,
  restoreWorkout,
  selectedIds,
  selectedWorkoutsCount,
  toggleWorkout,
  workouts,
}: WorkoutListProps) {
  const { colors } = useTheme();
  const [showHiddenWorkouts, setShowHiddenWorkouts] = useState(false);

  return (
    <>
      {isReading ? (
        <ActivityIndicator testID="health-connect-loading" style={styles.loader} />
      ) : workouts.length === 0 && hiddenWorkouts.length === 0 && isConnected ? (
        <Text style={[styles.message, { color: colors.onSurfaceVariant }]}>
          {renderHealthConnectLinks(isIOS ? copy.iosNoWorkouts : copy.noWorkouts, colors.primary)}
        </Text>
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
                    <View style={styles.workoutHeading}>
                      <Text variant="titleMedium">{workout.title || workout.sport}</Text>
                      <View style={styles.indicators}>
                        {Boolean(workout.heartRateSamples?.length) && (
                          <View
                            accessible
                            accessibilityRole="image"
                            accessibilityLabel={copy.workoutSignals.heartRateAvailable}
                            style={styles.indicator}>
                            <Icon source="heart-pulse" size={14} color={colors.primary} />
                            <Icon source="check" size={12} color={colors.primary} />
                          </View>
                        )}
                        {workout.locations.length > 0 && (
                          <View
                            accessible
                            accessibilityRole="image"
                            accessibilityLabel={copy.workoutSignals.gpsAvailable}
                            style={styles.indicator}>
                            <Icon source="map-marker-path" size={14} color={colors.primary} />
                            <Icon source="check" size={12} color={colors.primary} />
                          </View>
                        )}
                      </View>
                    </View>
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
          disabled={isImporting || selectedWorkoutsCount === 0}
          style={styles.button}>
          {formatImportSelectedLabel(selectedWorkoutsCount, isRussian)}
        </Button>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  copy: { flex: 1, gap: 2 },
  workoutHeading: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  indicators: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  indicator: { alignItems: 'center', flexDirection: 'row' },
  rowAction: { alignSelf: 'flex-end' },
  hiddenCopy: { paddingLeft: 12 },
  message: { marginTop: 8 },
  loader: { marginVertical: 24 },
  button: { marginTop: 6 },
});
