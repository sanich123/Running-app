import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { ActivityIndicator, Card, Icon, Text, useTheme } from 'react-native-paper';
import { renderHealthConnectLinks } from '../../health-connect-link/utils';
import { WORKOUT_IMPORT_COPY } from '../const';
import { getReadDiagnosticItems, getUploadDiagnosticItems } from '../helpers';
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
}: DiagnosticsCardProps) {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const copy = WORKOUT_IMPORT_COPY[isRussian ? 'ru' : 'en'].diagnostics;
  const isIOS = Platform.OS === 'ios';

  return (
    <Card style={[styles.card, { borderColor: colors.outlineVariant }]}>
      <Card.Content>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.title}
          accessibilityState={{ expanded: isExpanded }}
          onPress={() => setIsExpanded((expanded) => !expanded)}
          style={styles.accordionHeader}
          testID="workout-import-diagnostics-accordion">
          <View style={styles.accordionHeaderContent}>
            <ViewWithIcon icon="stethoscope" title={copy.title} />
          </View>
          <Icon source={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color={colors.onSurfaceVariant} />
        </Pressable>

        {isExpanded && (
          <View style={styles.details}>
            <DiagnosticsSection icon="connection" title={copy.sections.connection}>
              <View style={styles.metricsGrid}>
                <DiagnosticMetric
                  isRussian={isRussian}
                  label={copy.platform}
                  value={isIOS ? copy.platformNameIOS : copy.platformNameAndroid}
                />
                <DiagnosticMetric isRussian={isRussian} label={copy.store} value={availability ?? copy.checking} />
                <DiagnosticMetric isRussian={isRussian} label={copy.connected} status={isConnected} />
                <DiagnosticMetric isRussian={isRussian} label={copy.account} status={Boolean(userId)} />
              </View>
            </DiagnosticsSection>

            {isIOS ? (
              <Text variant="bodySmall" style={[styles.detailText, { color: colors.onSurfaceVariant }]}>
                {copy.iosDataAccessNote}
              </Text>
            ) : (
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
                  {renderHealthConnectLinks(copy.heartRateAccessNote, colors.primary)}
                </Text>
                <Text variant="bodySmall" style={[styles.detailText, { color: colors.onSurfaceVariant }]}>
                  {renderHealthConnectLinks(copy.routeAccessNote, colors.primary)}
                </Text>
              </DiagnosticsSection>
            )}

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

            <DiagnosticsSection icon="cloud-upload-outline" title={copy.sections.upload}>
              <DiagnosticList items={getUploadDiagnosticItems(uploadDiagnostics, isRussian)} />
            </DiagnosticsSection>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = {
  card: {
    marginTop: 2,
    borderWidth: 1,
  },
  accordionHeader: {
    alignItems: 'center' as const,
    flexDirection: 'row' as const,
    gap: 8,
  },
  accordionHeaderContent: {
    flex: 1,
    minWidth: 0,
  },
  details: {
    gap: 8,
    marginTop: 8,
  },
  metricsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 6,
  },
  detailText: {
    lineHeight: 17,
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
};
