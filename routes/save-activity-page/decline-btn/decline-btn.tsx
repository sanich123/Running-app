import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Button } from 'react-native-paper';
import { resetAdditionaInfoActivitySlice } from '@R/slices/actitivity-additional-info/activity-additional-info';
import { resetFinishedActivity } from '@R/slices/activity/activity';
import { resetManualActivitySlice } from '@R/slices/manual-activity/manual-activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import ConfirmDialog from '@S/confirm-dialog/confirm-dialog';
import { DECLINE_BTN } from './const';

export default function DeclineBtn({ isDisabled }: { isDisabled: boolean }) {
  const dispatch = useAppDispatch();
  const { replace } = useRouter();
  const { isDisabledWhileSending } = useAppSelector(({ activity }) => activity);
  const { language } = useAppSelector(({ language }) => language);
  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);

  function declineActivity() {
    dispatch(resetAdditionaInfoActivitySlice());
    dispatch(resetFinishedActivity());
    dispatch(resetManualActivitySlice());
    replace('/');
  }

  return (
    <>
      <Button
        icon="delete-outline"
        mode="outlined"
        onPress={() => setIsConfirmDialogVisible(true)}
        style={{ marginTop: 15 }}
        disabled={isDisabled || isDisabledWhileSending}>
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
