import { useState } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useDeleteActivityByIdMutation } from '@R/services/activity/activity';
import { finishLoading, startLoading } from '@R/slices/loading/loading';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { CARD_DELETE_BTN } from '@S/card/delete-btn/const';
import ConfirmDialog from '@S/confirm-dialog/confirm-dialog';
import { errorToast } from '@S/error-toast/error-toast';
import { ACTIVITY_ACTIONS_MENU, ACTIVITY_ACTIONS_MENU_TEST_IDS } from '../const';
import MenuItem from '../menu-item/menu-item';
import type { DeleteActivityButtonProps } from './types';

export default function DeleteActivityButton({ activity }: DeleteActivityButtonProps) {
  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);
  const [deleteActivityById, { isLoading: isDeleteRequestLoading }] = useDeleteActivityByIdMutation();
  const dispatch = useAppDispatch();
  const { back } = useRouter();
  const language = useAppSelector(({ settings }) => settings.language);
  const userId = useAppSelector(({ auth }) => auth.userId);
  const { isLoading } = useAppSelector(({ loading }) => loading);

  async function deleteActivity() {
    dispatch(startLoading());
    try {
      await deleteActivityById(activity.id).unwrap();
      back();
    } catch (error) {
      errorToast('', error);
    } finally {
      dispatch(finishLoading());
    }
  }

  if (userId !== activity.userId) return null;

  return (
    <>
      <MenuItem
        action="delete"
        label={ACTIVITY_ACTIONS_MENU[language].delete}
        testID={ACTIVITY_ACTIONS_MENU_TEST_IDS.delete}
        onPress={() => {
          if (isLoading || isDeleteRequestLoading) return;

          if (Platform.OS === 'web') void deleteActivity();
          else setIsConfirmDialogVisible(true);
        }}
      />
      <ConfirmDialog
        visible={isConfirmDialogVisible}
        title={CARD_DELETE_BTN[language].deleteActivity}
        message={CARD_DELETE_BTN[language].question}
        confirmText={CARD_DELETE_BTN[language].accept}
        loading={isDeleteRequestLoading}
        onDismiss={() => setIsConfirmDialogVisible(false)}
        onConfirm={async () => {
          setIsConfirmDialogVisible(false);
          await deleteActivity();
        }}
      />
    </>
  );
}
