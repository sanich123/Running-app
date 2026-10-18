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

export default function DeleteActivityButton({ activity, renderMenu }: DeleteActivityButtonProps) {
  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);
  const [deleteActivityById, { isLoading: isDeleteRequestLoading }] = useDeleteActivityByIdMutation();
  const dispatch = useAppDispatch();
  const { back } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { isLoading } = useAppSelector(({ loading }) => loading);

  async function deleteActivity() {
    dispatch(startLoading());
    try {
      await deleteActivityById(activity.id).unwrap();
      setIsConfirmDialogVisible(false);
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
      {renderMenu ? (
        renderMenu(
          <MenuItem
            action="delete"
            label={ACTIVITY_ACTIONS_MENU[language].delete}
            testID={ACTIVITY_ACTIONS_MENU_TEST_IDS.delete}
            onPress={() => {
              if (isLoading || isDeleteRequestLoading) return;

              if (Platform.OS === 'web') void deleteActivity();
              else setIsConfirmDialogVisible(true);
            }}
          />,
        )
      ) : (
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
      )}
      <ConfirmDialog
        visible={isConfirmDialogVisible}
        title={CARD_DELETE_BTN[language].deleteActivity}
        message={CARD_DELETE_BTN[language].question}
        confirmText={CARD_DELETE_BTN[language].accept}
        cancelText={CARD_DELETE_BTN[language].cancel}
        destructive
        loading={isDeleteRequestLoading}
        onDismiss={() => setIsConfirmDialogVisible(false)}
        onConfirm={deleteActivity}
      />
    </>
  );
}
