import { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { ActivityIndicator, Button, Card, ProgressBar, Text, useTheme } from 'react-native-paper';
import { LANGUAGES, ROUTES } from '@const/enums';
import { Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import { useGetStravaMigrationStatusQuery } from '@R/services/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { getMigrationArchiveAndSendToServer } from '@U/migration-strava/migration-archive';
import { MIGRATION_STATES, STRAVA_EXPORT_URL } from './const';
import useGetStates from './hooks';
import { removeStepNumber } from './utils';
import type { ActivityMigrationJobResponse } from '@R/runich-api/types';

const HOME_TAB_ROUTE = '(home)';

export default function MigrationFromStrava() {
  const { userId, accessToken } = useAppSelector(({ auth }) => auth);
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const { replace } = useRouter();
  const [migrationJobId, setMigrationJobId] = useState<string | null>(null);
  const [acceptedMigrationJob, setAcceptedMigrationJob] = useState<ActivityMigrationJobResponse | null>(null);
  const {
    isDisabled,
    setIsDisabled,
    isUnzipping,
    setIsUnzipping,
    isRemovingMedia,
    setIsRemovingMedia,
    isZipping,
    setIsZipping,
    isSendingArchive,
    setIsSendingArchive,
    isWaitingForServer,
    setIsWaitingForServer,
    isDeletingCacheFolder,
    setIsDeletingCacheFolder,
    isError,
    setIsError,
    isInitial,
  } = useGetStates();
  const {
    data: fetchedMigrationJob,
    error: migrationStatusError,
    refetch: refetchMigrationStatus,
  } = useGetStravaMigrationStatusQuery(migrationJobId ?? '', { skip: !migrationJobId });
  const migrationJob = fetchedMigrationJob ?? acceptedMigrationJob;
  const copy = MIGRATION_STATES[language];
  const isRussian = language === LANGUAGES.russian;
  const isServerStatusError = Boolean(migrationJobId && migrationStatusError);
  const isServerProcessing = Boolean(
    migrationJobId && !isServerStatusError && migrationJob?.status !== 'completed' && migrationJob?.status !== 'failed',
  );
  const isServerCompleted = migrationJob?.status === 'completed';
  const isServerFailed = migrationJob?.status === 'failed';
  const isProcessing = (isDisabled && !isError) || isServerProcessing || isServerStatusError;
  const hasStatusError = Boolean(isError) || isServerFailed || isServerStatusError;
  const statusText = isUnzipping
    ? copy.unzipping
    : isRemovingMedia
      ? copy.remove
      : isZipping
        ? copy.zipping
        : isSendingArchive
          ? isWaitingForServer
            ? copy.waitingForServer
            : copy.transfer
          : isDeletingCacheFolder
            ? copy.cleaning
            : isError
              ? copy.error
              : isServerStatusError
                ? copy.statusError
                : isServerCompleted
                  ? copy.successSending
                  : isServerFailed
                    ? migrationJob?.errorMessage || copy.failed
                    : isServerProcessing
                      ? migrationJob?.status === 'queued'
                        ? copy.queued
                        : copy.processing
                      : '';
  const buttonText =
    isServerProcessing || isServerStatusError
      ? copy.processing
      : isServerCompleted || isServerFailed
        ? copy.chooseArchive
        : isInitial
          ? copy.chooseArchive
          : isUnzipping
            ? copy.unzip
            : isRemovingMedia
              ? copy.removing
              : isZipping
                ? copy.zip
                : isSendingArchive
                  ? isWaitingForServer
                    ? copy.waiting
                    : copy.sending
                  : isDeletingCacheFolder
                    ? copy.clean
                    : copy.error;
  const steps = [copy.archiveToEmail, copy.whereToUpload];
  const progress = migrationJob?.totalActivities
    ? Math.min(1, migrationJob.processedActivities / migrationJob.totalActivities)
    : 0;
  const progressPercent = Math.round(progress * 100);
  const queueStatusText =
    migrationJob?.status === 'queued' &&
    typeof migrationJob.queuePosition === 'number' &&
    typeof migrationJob.queueAhead === 'number' &&
    typeof migrationJob.queueSize === 'number'
      ? migrationJob.queueAhead > 0
        ? copy.queueAhead(
            migrationJob.queueAhead,
            migrationJob.queuePosition ?? migrationJob.queueAhead + 1,
            migrationJob.queueSize,
          )
        : copy.queueNext(migrationJob.queuePosition ?? 1, migrationJob.queueSize)
      : null;

  useEffect(() => {
    if (migrationJob?.status === 'completed') {
      dispatch(runichApi.util.invalidateTags([Tags.activities]));
      if (migrationJob.processedActivities >= migrationJob.totalActivities) {
        replace(`/${ROUTES.tabs}/${HOME_TAB_ROUTE}`);
      }
    }

    if (!migrationJobId || migrationJob?.status === 'completed' || migrationJob?.status === 'failed') return;

    let isCancelled = false;
    let timeout: ReturnType<typeof setTimeout>;
    const poll = async () => {
      const result = await refetchMigrationStatus();
      if (!isCancelled && result.data?.status !== 'completed' && result.data?.status !== 'failed') {
        timeout = setTimeout(poll, 2000);
      }
    };
    timeout = setTimeout(poll, 2000);

    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [
    dispatch,
    migrationJobId,
    migrationJob?.processedActivities,
    migrationJob?.status,
    migrationJob?.totalActivities,
    refetchMigrationStatus,
    replace,
  ]);

  const handleArchiveUploadAccepted = (job: ActivityMigrationJobResponse) => {
    setIsError('');
    setAcceptedMigrationJob(job);
    setMigrationJobId(job.jobId);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: colors.primaryContainer }]}>
            <MaterialCommunityIcons name="database-import-outline" size={28} color={colors.primary} />
          </View>
          <Text variant="headlineSmall" style={styles.title}>
            {isRussian ? 'Миграция из Strava' : 'Migration from Strava'}
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
            {copy.ableToTransfer}
          </Text>
        </View>

        <Card style={[styles.card, { backgroundColor: colors.surface }]} mode="contained">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {isRussian ? 'Как это работает' : 'How it works'}
            </Text>
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primaryContainer }]}>
                <Text variant="labelLarge" style={{ color: colors.primary }}>
                  1
                </Text>
              </View>
              <Link href={STRAVA_EXPORT_URL} style={[styles.stepText, { color: colors.primary }]}>
                {removeStepNumber(copy.moreInfo)}
              </Link>
            </View>
            {steps.map((step, index) => (
              <View key={step} style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primaryContainer }]}>
                  <Text variant="labelLarge" style={{ color: colors.primary }}>
                    {index + 2}
                  </Text>
                </View>
                <Text variant="bodyMedium" style={styles.stepText}>
                  {removeStepNumber(step)}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        <View style={[styles.notice, { backgroundColor: colors.tertiaryContainer }]}>
          <MaterialCommunityIcons name="information-outline" size={22} color={colors.tertiary} />
          <Text variant="bodyMedium" style={{ color: colors.onTertiaryContainer, flex: 1 }}>
            {copy.removeMedia} {copy.processUnZipping} {copy.wifiConnection} {copy.serverResponseTime}
          </Text>
        </View>

        <View style={[styles.notice, { backgroundColor: colors.secondaryContainer }]}>
          <MaterialCommunityIcons name="file-alert-outline" size={22} color={colors.secondary} />
          <Text variant="bodyMedium" style={{ color: colors.onSecondaryContainer, flex: 1 }}>
            {copy.archiveLimit}
            <Link href={`/${ROUTES.feedback}`} style={{ color: colors.primary }}>
              {copy.feedbackLink}
            </Link>
            .
          </Text>
        </View>

        {(isProcessing || migrationJobId || Boolean(isError)) && (
          <View
            style={[
              styles.status,
              {
                backgroundColor: hasStatusError
                  ? colors.errorContainer
                  : isServerCompleted
                    ? colors.tertiaryContainer
                    : colors.surface,
              },
            ]}>
            <View style={styles.statusHeader}>
              {isProcessing && <ActivityIndicator size="small" color={colors.primary} />}
              {!isProcessing && isServerCompleted && (
                <MaterialCommunityIcons name="check-circle-outline" size={24} color={colors.tertiary} />
              )}
              {!isProcessing && hasStatusError && (
                <MaterialCommunityIcons name="alert-circle-outline" size={24} color={colors.error} />
              )}
              <Text
                variant="bodyMedium"
                style={[
                  styles.statusText,
                  {
                    color: hasStatusError
                      ? colors.onErrorContainer
                      : isServerCompleted
                        ? colors.onTertiaryContainer
                        : colors.onSurface,
                  },
                ]}>
                {statusText}
              </Text>
            </View>
            {queueStatusText && (
              <View style={[styles.queueNotice, { backgroundColor: colors.primaryContainer }]}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={colors.primary} />
                <Text variant="bodySmall" style={{ color: colors.onPrimaryContainer, flex: 1 }}>
                  {queueStatusText}
                </Text>
              </View>
            )}
            {migrationJob && (
              <View style={styles.progressDetails}>
                <View style={styles.progressHeader}>
                  <Text variant="labelLarge" style={{ color: colors.onSurfaceVariant }}>
                    {copy.progress}
                  </Text>
                  <Text variant="titleMedium" style={{ color: colors.primary }}>
                    {progressPercent}%
                  </Text>
                </View>
                <ProgressBar progress={progress} color={colors.primary} style={styles.progressBar} />
                <View style={styles.progressStats}>
                  <View style={[styles.progressStat, { backgroundColor: colors.surfaceVariant }]}>
                    <Text variant="titleMedium" style={{ color: colors.onSurface }}>
                      {migrationJob.processedActivities}/{migrationJob.totalActivities || '—'}
                    </Text>
                    <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
                      {copy.processed}
                    </Text>
                  </View>
                  <View style={[styles.progressStat, { backgroundColor: colors.surfaceVariant }]}>
                    <Text variant="titleMedium" style={{ color: colors.tertiary }}>
                      {migrationJob.importedActivities}
                    </Text>
                    <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
                      {copy.imported}
                    </Text>
                  </View>
                  <View style={[styles.progressStat, { backgroundColor: colors.surfaceVariant }]}>
                    <Text variant="titleMedium" style={{ color: colors.error }}>
                      {migrationJob.skippedActivities}
                    </Text>
                    <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
                      {copy.skipped}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {!isProcessing && (
          <Button
            mode="contained"
            icon={
              isInitial || isServerCompleted || isServerFailed
                ? 'file-upload-outline'
                : isError
                  ? 'refresh'
                  : 'progress-clock'
            }
            onPress={async () => {
              if (isServerCompleted || isServerFailed) {
                setMigrationJobId(null);
                setAcceptedMigrationJob(null);
              }
              await getMigrationArchiveAndSendToServer({
                setIsDisabled,
                setIsUnzipping,
                setIsRemovingMedia,
                setIsZipping,
                setIsSendingArchive,
                setIsWaitingForServer,
                setIsDeletingCacheFolder,
                setIsError,
                onArchiveUploadAccepted: handleArchiveUploadAccepted,
                userId,
                accessToken,
              });
            }}
            style={styles.action}
            contentStyle={styles.actionContent}>
            {buttonText}
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  container: {
    alignSelf: 'center',
    gap: 14,
    maxWidth: 620,
    width: '100%',
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  heroIcon: {
    alignItems: 'center',
    borderRadius: 20,
    height: 64,
    justifyContent: 'center',
    marginBottom: 12,
    width: 64,
  },
  title: {
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  card: {
    borderRadius: 18,
  },
  sectionTitle: {
    marginBottom: 14,
  },
  step: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  stepNumber: {
    alignItems: 'center',
    borderRadius: 10,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  stepText: {
    flex: 1,
    lineHeight: 20,
  },
  notice: {
    alignItems: 'flex-start',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  status: {
    alignItems: 'stretch',
    borderRadius: 16,
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statusHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  queueNotice: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    padding: 10,
  },
  statusText: {
    flex: 1,
  },
  progressDetails: {
    gap: 10,
    marginTop: 12,
  },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStats: {
    flexDirection: 'row',
    gap: 8,
  },
  progressStat: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  progressBar: {
    height: 7,
  },
  action: {
    borderRadius: 14,
  },
  actionContent: {
    minHeight: 52,
  },
});
