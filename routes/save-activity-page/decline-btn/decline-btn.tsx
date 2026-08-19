import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { resetActivityDraft, resetFinishedActivity } from '@R/slices/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import ConfirmDialog from '@S/confirm-dialog/confirm-dialog';
import { DECLINE_BTN } from './const';

export default function DeclineBtn({ isDisabled }: { isDisabled: boolean }) {
  const dispatch = useAppDispatch();
  const { replace } = useRouter();
  const { isSavingDisabled } = useAppSelector(({ activity }) => activity);
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);
  const shouldBeDisabled = isDisabled || isSavingDisabled;

  function declineActivity() {
    dispatch(resetActivityDraft());
    dispatch(resetFinishedActivity());
    replace(ROUTES.root);
  }

  return (
    <>
      <Button
        icon="delete-outline"
        mode="outlined"
        compact
        onPress={() => setIsConfirmDialogVisible(true)}
        style={[styles.button, { borderColor: colors.error }, shouldBeDisabled && styles.disabledButton]}
        contentStyle={styles.content}
        textColor={colors.error}
        disabled={shouldBeDisabled}>
        {DECLINE_BTN[language].cancel}
      </Button>
      <ConfirmDialog
        visible={isConfirmDialogVisible}
        title={DECLINE_BTN[language].action}
        message={DECLINE_BTN[language].question}
        confirmText={DECLINE_BTN[language].accept}
        onDismiss={() => setIsConfirmDialogVisible(false)}
        onConfirm={() => {
          setIsConfirmDialogVisible(false);
          declineActivity();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: { alignSelf: 'stretch', borderRadius: 8, marginTop: 12 },
  content: { minHeight: 40 },
  disabledButton: { opacity: 0.7 },
});
