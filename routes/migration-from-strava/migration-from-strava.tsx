import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import {
  acceptMigrationJob,
  clearMigrationError,
  resetMigration,
  setIsDeletingCacheFolder,
  setIsDisabled,
  setIsRemovingMedia,
  setIsSendingArchive,
  setIsUnzipping,
  setIsWaitingForServer,
  setIsZipping,
  setMigrationError,
  setUploadProgress,
} from '@R/slices/migration/migration';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { startStravaMigration } from '@U/migration-strava/migration-archive';
import { MIGRATION_STATES } from './const';
import useMigrationState from './hooks';
import MigrationActions from './migration-actions';
import MigrationInstructions from './migration-instructions';
import MigrationStatus from './migration-status';
import type { MigrationCancelHandler } from '@U/migration-strava/types';

const HOME_TAB_ROUTE = '(home)';

export default function MigrationFromStrava() {
  const dispatch = useAppDispatch();
  const { userId, accessToken } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const { replace } = useRouter();
  const state = useMigrationState();
  const copy = MIGRATION_STATES[language];
  const [isCancelAvailable, setIsCancelAvailable] = useState(false);
  const cancelMigrationRef = useRef<MigrationCancelHandler>(null);

  useEffect(() => {
    if (!state.isServerCompleted || state.progress < 1) return;
    replace(`/${ROUTES.tabs}/${HOME_TAB_ROUTE}`);
  }, [replace, state.isServerCompleted, state.progress]);

  const handleCancelReady = (cancel: MigrationCancelHandler) => {
    cancelMigrationRef.current = cancel;
    setIsCancelAvailable(Boolean(cancel));
  };

  const handleCancel = () => {
    cancelMigrationRef.current?.();
  };

  const handleChooseArchive = async () => {
    dispatch(resetMigration());
    try {
      await startStravaMigration({
        setIsDisabled: (value) => dispatch(setIsDisabled(value)),
        setIsUnzipping: (value) => dispatch(setIsUnzipping(value)),
        setIsRemovingMedia: (value) => dispatch(setIsRemovingMedia(value)),
        setIsZipping: (value) => dispatch(setIsZipping(value)),
        setIsSendingArchive: (value) => dispatch(setIsSendingArchive(value)),
        setIsWaitingForServer: (value) => dispatch(setIsWaitingForServer(value)),
        setIsDeletingCacheFolder: (value) => dispatch(setIsDeletingCacheFolder(value)),
        setUploadProgress: (value) => dispatch(setUploadProgress(value)),
        setIsError: (value) => dispatch(setMigrationError(value)),
        onCancelReady: handleCancelReady,
        onArchiveUploadAccepted: (job) => dispatch(acceptMigrationJob(job)),
        userId,
        accessToken,
      });
    } catch (error) {
      errorToast('Ошибка миграции из Strava', error);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <MigrationInstructions copy={copy} />
        <MigrationStatus state={state} copy={copy} onDismissError={() => dispatch(clearMigrationError())} />
        <MigrationActions
          isProcessing={state.isProcessing}
          isCancelAvailable={isCancelAvailable}
          isInitial={state.isInitial}
          isServerCompleted={state.isServerCompleted}
          isServerFailed={state.isServerFailed}
          hasError={Boolean(state.error)}
          copy={copy}
          onChooseArchive={handleChooseArchive}
          onCancel={handleCancel}
        />
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
});
