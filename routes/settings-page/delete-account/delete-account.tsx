import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ROUTES } from '@const/enums';
import { useDeleteUserMutation } from '@R/services/authentication/authentication';
import { persistor, resetStore } from '@R/store';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import ConfirmDialog from '@S/confirm-dialog/confirm-dialog';
import { errorToast } from '@S/error-toast/error-toast';
import { DELETE_ACCOUNT } from './const';
import SettingsRow from '../settings-row/settings-row';

export default function DeleteAccountBtn() {
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const dispatch = useAppDispatch();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteUserMutation();
  const { replace, canDismiss, dismissAll } = useRouter();
  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);

  async function deleteUserHandler() {
    if (isDeleting) return;

    try {
      await deleteAccount({ userId }).unwrap();
      await persistor.purge();
      dispatch(resetStore());
      if (canDismiss()) {
        dismissAll();
      }
      replace(`/${ROUTES.signIn}`);
    } catch (error) {
      errorToast('Не удалось удалить аккаунт', error);
    } finally {
      setIsConfirmDialogVisible(false);
    }
  }

  return (
    <View>
      <SettingsRow
        icon="delete-outline"
        title={DELETE_ACCOUNT[language].action}
        destructive
        onPress={() => setIsConfirmDialogVisible(true)}
      />
      <ConfirmDialog
        visible={isConfirmDialogVisible}
        title={DELETE_ACCOUNT[language].deletingAccount}
        message={DELETE_ACCOUNT[language].conscentDeleting}
        confirmText={DELETE_ACCOUNT[language].sure}
        loading={isDeleting}
        onDismiss={() => {
          if (!isDeleting) setIsConfirmDialogVisible(false);
        }}
        onConfirm={deleteUserHandler}
      />
    </View>
  );
}
