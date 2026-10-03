import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { resetMigration } from '@R/slices/migration/migration';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { MIGRATION_STATES } from './const';
import MigrationInstructions from './migration-instructions';
import MigrationStatus from './migration-status';
import MigrationStatusSync from './migration-status-sync';
import useMigrationController from './use-migration-controller';

export default function MigrationFromStrava() {
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const { handleCancel, handleChooseArchive, isCancelAvailable, isForegroundUploadSession, state } =
    useMigrationController();
  const copy = MIGRATION_STATES[language];

  return (
    <>
      <MigrationStatusSync />
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.instructions}>
            <MigrationInstructions copy={copy} />
          </View>
          <View style={styles.migrationBlock}>
            <MigrationStatus
              state={state}
              copy={copy}
              isProcessing={state.isProcessing}
              isCancelAvailable={isCancelAvailable || state.job?.status === 'uploading'}
              isForegroundUploadSession={isForegroundUploadSession}
              onChooseArchive={handleChooseArchive}
              onCancel={handleCancel}
              onDismissError={() => dispatch(resetMigration())}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  container: {
    alignSelf: 'center',
    maxWidth: 620,
    width: '100%',
  },
  instructions: {
    gap: 14,
    marginBottom: 16,
  },
  migrationBlock: {
    width: '100%',
  },
});
