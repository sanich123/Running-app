import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ROUTES } from '@const/enums';
import { useDeleteUserMutation } from '@R/services/authentication/authentication';
import { resetActivitySlice } from '@R/slices/activity/activity';
import { resetAuthSlice } from '@R/slices/auth/auth';
import { resetLanguageSlice } from '@R/slices/language/language';
import { resetLocationSlice } from '@R/slices/location/location';
import { resetMainFeedSlice } from '@R/slices/main-feed/main-feed';
import { resetNetworkSlice } from '@R/slices/network/network';
import { resetProfileSlice } from '@R/slices/profile/profile';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import ConfirmDialog from '@S/confirm-dialog/confirm-dialog';
import { errorToast } from '@S/error-toast/error-toast';
import { DELETE_ACCOUNT } from './const';
import SettingsRow from '../settings-row/settings-row';

export default function DeleteAccountBtn() {
  const { language } = useAppSelector(({ language }) => language);
  const { userId } = useAppSelector(({ auth }) => auth);
  const dispatch = useAppDispatch();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteUserMutation();
  const { replace } = useRouter();
  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);

  async function deleteUserHandler() {
    if (isDeleting) return;

    try {
      await deleteAccount({ userId }).unwrap();
      dispatch(resetProfileSlice());
      dispatch(resetActivitySlice());
      dispatch(resetMainFeedSlice());
      dispatch(resetAuthSlice());
      dispatch(resetNetworkSlice());
      dispatch(resetLanguageSlice());
      dispatch(resetLocationSlice());
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
