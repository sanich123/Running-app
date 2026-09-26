import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { resetMigration } from '@R/slices/migration/migration';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { MIGRATION_STATES } from './const';
import MigrationInstructions from './migration-instructions';
import MigrationStatus from './migration-status';
import useMigrationController from './use-migration-controller';

const HOME_TAB_ROUTE = '(home)';

export default function MigrationFromStrava() {
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const { replace } = useRouter();
  const { handleCancel, handleChooseArchive, isCancelAvailable, state } = useMigrationController();
  const copy = MIGRATION_STATES[language];

  useEffect(() => {
    if (!state.isServerCompleted || state.progress < 1) return;
    replace(`/${ROUTES.tabs}/${HOME_TAB_ROUTE}`);
  }, [replace, state.isServerCompleted, state.progress]);

  return (
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
            onChooseArchive={handleChooseArchive}
            onCancel={handleCancel}
            onDismissError={() => dispatch(resetMigration())}
          />
        </View>
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
