import { useAuth } from '@A/context/auth-context';
import { useAppSelector } from '@R/typed-hooks';
import { getMigrationArchiveAndSendToServer } from '@U/migration-strava/migration-archive';
import { Link } from 'expo-router';
import { View } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import useGetStates from './hooks';
import { MIGRATION_STATES } from './const';

export default function MigrationFromStrava() {
  const { user } = useAuth();
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
    isDeletingCacheFolder,
    setIsDeletingCacheFolder,
    isSuccess,
    setIsSuccess,
    isError,
    setIsError,
    isInitial,
  } = useGetStates();
  const { language } = useAppSelector(({ language }) => language);
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', marginVertical: 15 }}>
      <Text variant="titleMedium">{MIGRATION_STATES[language].ableToTransfer}</Text>
      <View style={{ flex: 1, marginVertical: 15, justifyContent: 'flex-start', padding: 10, gap: 5 }}>
        <Link href="https://support.strava.com/hc/en-us/articles/216918437-Exporting-your-Data-and-Bulk-Export#h_01GG58HC4F1BGQ9PQZZVANN6WF">
          <Text variant="bodyLarge" style={{ color: colors.primary }}>
            {MIGRATION_STATES[language].moreInfo}
          </Text>
        </Link>
        <Text variant="bodyLarge"> {MIGRATION_STATES[language].archiveToEmail}</Text>
        <Text variant="bodyLarge"> {MIGRATION_STATES[language].whereToUpload}</Text>
        <Text variant="bodyLarge">{MIGRATION_STATES[language].removeMedia}</Text>
        <Text variant="bodyLarge">{MIGRATION_STATES[language].processUnZipping}</Text>
        <Text variant="bodyLarge">{MIGRATION_STATES[language].wifiConnection}</Text>
        <Text variant="bodyLarge" style={{ marginHorizontal: 10 }}>
          {isUnzipping && MIGRATION_STATES[language].unzipping}
          {isRemovingMedia && MIGRATION_STATES[language].remove}
          {isZipping && MIGRATION_STATES[language].zipping}
          {isSendingArchive && MIGRATION_STATES[language].transfer}
          {isDeletingCacheFolder && MIGRATION_STATES[language].cleaning}
          {isSuccess && MIGRATION_STATES[language].successSending}
          {isError && MIGRATION_STATES[language].error}
        </Text>
        <Button
          mode="outlined"
          onPress={async () =>
            getMigrationArchiveAndSendToServer({
              setIsDisabled,
              setIsUnzipping,
              setIsRemovingMedia,
              setIsZipping,
              setIsSendingArchive,
              setIsDeletingCacheFolder,
              setIsSuccess,
              setIsError,
              userId: `${user?.id}`,
            })
          }
          disabled={isDisabled}>
          {isInitial && MIGRATION_STATES[language].chooseArchive}
          {isUnzipping && MIGRATION_STATES[language].unzip}
          {isRemovingMedia && MIGRATION_STATES[language].removing}
          {isZipping && MIGRATION_STATES[language].zip}
          {isSendingArchive && MIGRATION_STATES[language].sending}
          {isDeletingCacheFolder && MIGRATION_STATES[language].clean}
          {isSuccess && MIGRATION_STATES[language].success}
          {isError && MIGRATION_STATES[language].error}
        </Button>
      </View>
    </View>
  );
}
