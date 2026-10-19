import { View } from 'react-native';
import { ActivityIndicator, Card, Icon, Text, useTheme } from 'react-native-paper';
import { renderHealthConnectLinks } from '../../health-connect-link';
import { WORKOUT_IMPORT_COPY } from '../const';
import {
  formatWorkoutCountNotice,
  formatWorkoutDiagnostics,
  getReadDiagnosticItems,
  getUploadDiagnosticItems,
} from '../helpers';
import { MAX_DIAGNOSTIC_WORKOUTS } from './const';
import DiagnosticList from './diagnostic-list/diagnostic-list';
import DiagnosticMetric from './diagnostic-metric/diagnostic-metric';
import DiagnosticsSection from './diagnostics-section/diagnostics-section';
import ViewWithIcon from './view-with-icon/view-with-icon';
import type { DiagnosticsCardProps } from '../../types';

export default function DiagnosticsCard({
  availability,
  healthPermissions,
  healthStatusErrorCode,
  isConnected,
  isReading,
  isRussian,
  readDiagnostics,
  uploadDiagnostics,
  userId,
  workouts,
}: DiagnosticsCardProps) {
  const { colors } = useTheme();
  const copy = WORKOUT_IMPORT_COPY[isRussian ? 'ru' : 'en'].diagnostics;

  return (
    <Card style={[styles.card, { borderColor: colors.outlineVariant }]}>
      <Card.Content>
        <ViewWithIcon icon="stethoscope" title={copy.title} subtitle={copy.subtitle} />

        <View style={styles.details}>
          <DiagnosticsSection icon="connection" title={copy.sections.connection}>
            <View style={styles.metricsGrid}>
              <DiagnosticMetric isRussian={isRussian} label={copy.platform} value="Android" />
              <DiagnosticMetric isRussian={isRussian} label={copy.store} value={availability ?? copy.checking} />
              <DiagnosticMetric isRussian={isRussian} label={copy.connected} status={isConnected} />
              <DiagnosticMetric isRussian={isRussian} label={copy.account} status={Boolean(userId)} />
            </View>
          </DiagnosticsSection>

          <DiagnosticsSection icon="shield-check-outline" title={copy.sections.permissions}>
            <View style={styles.metricsGrid}>
              <DiagnosticMetric
                isRussian={isRussian}
                label={copy.requiredPermissions}
                status={healthPermissions?.granted}
              />
              <DiagnosticMetric
                isRussian={isRussian}
                label={copy.permissionItems.exerciseSession}
                status={healthPermissions?.details?.exerciseSession}
              />
              <DiagnosticMetric
                isRussian={isRussian}
                label={copy.permissionItems.distance}
                status={healthPermissions?.details?.distance}
              />
              <DiagnosticMetric
                isRussian={isRussian}
                label={copy.permissionItems.steps}
                status={healthPermissions?.details?.steps}
              />
              <DiagnosticMetric
                isRussian={isRussian}
                label={copy.permissionItems.heartRate}
                status={healthPermissions?.details?.heartRate}
              />
              <DiagnosticMetric
                isRussian={isRussian}
                label={copy.permissionItems.activeCalories}
                status={healthPermissions?.details?.activeCalories}
              />
            </View>
            <Text variant="bodySmall" style={[styles.detailText, { color: colors.onSurfaceVariant }]}>
              {copy.heartRateAccessNote}
            </Text>
            <Text variant="bodySmall" style={[styles.detailText, { color: colors.onSurfaceVariant }]}>
              {copy.routeAccessNote}
            </Text>
          </DiagnosticsSection>

          {healthStatusErrorCode && (
            <View style={[styles.errorNotice, { backgroundColor: colors.errorContainer }]}>
              <Icon source="alert-circle-outline" size={20} color={colors.onErrorContainer} />
              <Text variant="bodySmall" style={{ color: colors.onErrorContainer, flex: 1 }}>
                {renderHealthConnectLinks(`${copy.statusError}: ${healthStatusErrorCode}`, colors.primary)}
              </Text>
            </View>
          )}

          <DiagnosticsSection icon="database-search-outline" title={copy.sections.reading}>
            <DiagnosticList items={getReadDiagnosticItems(readDiagnostics, isRussian)} />
            {isReading && <ActivityIndicator size="small" style={styles.readingIndicator} />}
          </DiagnosticsSection>

          <DiagnosticsSection icon="map-marker-path" title={copy.sections.workouts}>
            {workouts.length === 0 ? (
              <DiagnosticList items={[{ label: copy.workouts, value: '0', tone: 'muted' }]} />
            ) : (
              <View style={styles.workoutList}>
                {workouts.slice(0, MAX_DIAGNOSTIC_WORKOUTS).map((workout, index) => (
                  <Text
                    key={`${workout.source}:${workout.sourceActivityId}`}
                    variant="bodySmall"
                    style={styles.workoutText}>
                    {renderHealthConnectLinks(
                      formatWorkoutDiagnostics(
                        workout,
                        index,
                        isRussian,
                        uploadDiagnostics?.workouts.find(
                          (uploadWorkout) =>
                            uploadWorkout.source === workout.source &&
                            uploadWorkout.sourceActivityId === workout.sourceActivityId,
                        ),
                      ),
                      colors.primary,
                    )}
                  </Text>
                ))}
                {workouts.length > MAX_DIAGNOSTIC_WORKOUTS && (
                  <Text variant="bodySmall" style={[styles.detailText, { color: colors.onSurfaceVariant }]}>
                    {formatWorkoutCountNotice(workouts.length, isRussian)}
                  </Text>
                )}
              </View>
            )}
          </DiagnosticsSection>

          <DiagnosticsSection icon="cloud-upload-outline" title={copy.sections.upload}>
            <DiagnosticList items={getUploadDiagnosticItems(uploadDiagnostics, isRussian)} />
          </DiagnosticsSection>

          <Text variant="bodySmall" style={[styles.note, { color: colors.onSurfaceVariant }]}>
            {copy.note}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = {
  card: {
    marginTop: 2,
    borderWidth: 1,
  },
  header: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 0,
    minWidth: 0,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  section: {
    gap: 10,
  },
  details: {
    gap: 18,
    marginTop: 18,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  metricsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  metric: {
    width: '47%' as const,
    minHeight: 48,
    justifyContent: 'space-between' as const,
    gap: 4,
  },
  metricValue: {
    fontWeight: '600' as const,
  },
  status: {
    alignSelf: 'flex-start' as const,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  detailText: {
    lineHeight: 19,
  },
  list: {
    borderRadius: 10,
    overflow: 'hidden' as const,
  },
  listRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 12,
    minHeight: 38,
    paddingVertical: 8,
  },
  listLabel: {
    flex: 0.9,
  },
  listValue: {
    flex: 1.4,
    textAlign: 'right' as const,
    lineHeight: 18,
  },
  errorNotice: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    borderRadius: 10,
    padding: 10,
  },
  readingIndicator: {
    alignSelf: 'flex-start' as const,
  },
  workoutList: {
    gap: 8,
  },
  workoutText: {
    lineHeight: 20,
  },
  note: {
    lineHeight: 19,
    marginTop: 16,
  },
};
