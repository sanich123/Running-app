import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { ActivityIndicator, Button, Card, Text, useTheme } from 'react-native-paper';
import { LANGUAGES, ROUTES } from '@const/enums';
import { Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { getMigrationArchiveAndSendToServer } from '@U/migration-strava/migration-archive';
import { MIGRATION_STATES, STRAVA_EXPORT_URL } from './const';
import useGetStates from './hooks';
import { removeStepNumber } from './utils';

export default function MigrationFromStrava() {
  const { userId, accessToken } = useAppSelector(({ auth }) => auth);
  const dispatch = useAppDispatch();
  const { replace } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
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
    isSuccess,
    setIsSuccess,
    isError,
    setIsError,
    isInitial,
  } = useGetStates();
  const copy = MIGRATION_STATES[language];
  const isRussian = language === LANGUAGES.russian;
  const isProcessing = isDisabled && !isSuccess && !isError;
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
            : isSuccess
              ? copy.successSending
              : isError
                ? copy.error
                : '';
  const buttonText = isInitial
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
              : isSuccess
                ? copy.success
                : copy.error;
  const steps = [copy.archiveToEmail, copy.whereToUpload];

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

        {(isProcessing || isSuccess || Boolean(isError)) && (
          <View
            style={[
              styles.status,
              {
                backgroundColor: isError
                  ? colors.errorContainer
                  : isSuccess
                    ? colors.tertiaryContainer
                    : colors.surface,
              },
            ]}>
            {isProcessing && <ActivityIndicator size="small" color={colors.primary} />}
            {isSuccess && <MaterialCommunityIcons name="check-circle-outline" size={24} color={colors.tertiary} />}
            {Boolean(isError) && <MaterialCommunityIcons name="alert-circle-outline" size={24} color={colors.error} />}
            <Text
              variant="bodyMedium"
              style={{
                color: isError ? colors.onErrorContainer : isSuccess ? colors.onTertiaryContainer : colors.onSurface,
              }}>
              {statusText}
            </Text>
          </View>
        )}

        <Button
          mode="contained"
          icon={isInitial ? 'file-upload-outline' : isSuccess ? 'check' : isError ? 'refresh' : 'progress-clock'}
          onPress={async () =>
            getMigrationArchiveAndSendToServer({
              setIsDisabled,
              setIsUnzipping,
              setIsRemovingMedia,
              setIsZipping,
              setIsSendingArchive,
              setIsWaitingForServer,
              setIsDeletingCacheFolder,
              setIsSuccess,
              setIsError,
              onArchiveUploadSuccess: () => {
                dispatch(runichApi.util.invalidateTags([Tags.activities]));
                replace(ROUTES.root);
              },
              userId,
              accessToken,
            })
          }
          disabled={isDisabled && !isError}
          style={styles.action}
          contentStyle={styles.actionContent}>
          {buttonText}
        </Button>
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
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  action: {
    borderRadius: 14,
  },
  actionContent: {
    minHeight: 52,
  },
});
