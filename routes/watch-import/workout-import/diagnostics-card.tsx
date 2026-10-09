import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Card, Icon, Text, useTheme } from 'react-native-paper';
import { WORKOUT_IMPORT_COPY } from './const';
import {
  formatWorkoutCountNotice,
  formatWorkoutDiagnostics,
  getReadDiagnosticItems,
  getUploadDiagnosticItems,
  getBooleanLabel,
  getWorkoutId,
} from './helpers';
import type { DiagnosticItem, ReadDiagnostics, UploadDiagnostics } from './types';
import type { HealthPermissionsResult, WatchWorkout } from '../../../modules/runich-health/src/RunichHealth';

interface DiagnosticsCardProps {
  availability: string | null;
  healthPermissions: HealthPermissionsResult | null;
  healthStatusErrorCode: string | null;
  isConnected: boolean;
  isReading: boolean;
  isRussian: boolean;
  readDiagnostics: ReadDiagnostics | null;
  uploadDiagnostics: UploadDiagnostics | null;
  userId: string | null;
  workouts: WatchWorkout[];
}

interface DiagnosticsSectionProps extends PropsWithChildren {
  icon: string;
  title: string;
}

interface DiagnosticMetricProps {
  isRussian: boolean;
  label: string;
  value?: string;
  status?: boolean;
}

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
          </View>
          <Text variant="bodySmall" style={[styles.detailText, { color: colors.onSurfaceVariant }]}>
            {copy.routeAccessNote}
          </Text>
        </DiagnosticsSection>

        {healthStatusErrorCode && (
          <View style={[styles.errorNotice, { backgroundColor: colors.errorContainer }]}>
            <Icon source="alert-circle-outline" size={20} color={colors.onErrorContainer} />
            <Text variant="bodySmall" style={{ color: colors.onErrorContainer, flex: 1 }}>
              {copy.statusError}: {healthStatusErrorCode}
            </Text>
          </View>
        )}

        <DiagnosticsSection icon="database-search-outline" title={copy.sections.reading}>
          <DiagnosticList items={getReadDiagnosticItems(readDiagnostics, isRussian)} />
          {isReading && <ActivityIndicator size="small" style={styles.readingIndicator} />}
          {workouts.length > 0 && (
            <View style={styles.workoutsBlock}>
              <Text variant="labelLarge" style={{ color: colors.onSurface }}>
                {copy.sections.workouts}
              </Text>
              {workouts.slice(0, 50).map((workout, index) => (
                <View
                  key={getWorkoutId(workout)}
                  style={[styles.workoutRow, { backgroundColor: colors.surfaceVariant }]}>
                  <Text variant="bodySmall" style={{ color: colors.onSurface }}>
                    {formatWorkoutDiagnostics(workout, index, isRussian)}
                  </Text>
                </View>
              ))}
              {workouts.length > 50 && (
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
      </Card.Content>
    </Card>
  );
}

function ViewWithIcon({ icon, subtitle, title }: { icon: string; subtitle: string; title: string }) {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <View style={[styles.headerIcon, { backgroundColor: colors.primaryContainer }]}>
        <Icon source={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.headerCopy}>
        <Text variant="titleMedium">{title}</Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function DiagnosticsSection({ children, icon, title }: DiagnosticsSectionProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon source={icon} size={18} color={colors.primary} />
        <Text variant="titleSmall">{title}</Text>
      </View>
      {children}
    </View>
  );
}

function DiagnosticMetric({ isRussian, label, status, value }: DiagnosticMetricProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.metric}>
      <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
        {label}
      </Text>
      {status === undefined ? (
        <Text variant="bodySmall" style={styles.metricValue}>
          {value}
        </Text>
      ) : (
        <View style={[styles.status, { backgroundColor: status ? colors.primaryContainer : colors.errorContainer }]}>
          <Text variant="labelMedium" style={{ color: status ? colors.onPrimaryContainer : colors.onErrorContainer }}>
            {getBooleanLabel(status, isRussian)}
          </Text>
        </View>
      )}
    </View>
  );
}

function DiagnosticList({ items }: { items: DiagnosticItem[] }) {
  const { colors } = useTheme();

  return (
    <View style={styles.list}>
      {items.map((item, index) => {
        const valueColor =
          item.tone === 'error'
            ? colors.error
            : item.tone === 'success'
              ? colors.primary
              : item.tone === 'muted'
                ? colors.onSurfaceVariant
                : colors.onSurface;

        return (
          <View key={`${item.label}-${index}`} style={styles.listRow}>
            <Text variant="labelMedium" style={[styles.listLabel, { color: colors.onSurfaceVariant }]}>
              {item.label}
            </Text>
            <Text variant="bodySmall" style={[styles.listValue, { color: valueColor }]}>
              {item.value}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = {
  card: {
    marginTop: 2,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 18,
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
  },
  section: {
    gap: 10,
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
  workoutsBlock: {
    gap: 8,
  },
  workoutRow: {
    borderRadius: 10,
    padding: 10,
  },
  note: {
    lineHeight: 19,
    marginTop: 16,
  },
};
