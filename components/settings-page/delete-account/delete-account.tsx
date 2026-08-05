import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useDeleteUserMutation } from '@R/services/authentication/authentication';
import { resetActivitySlice } from '@R/slices/activity/activity';
import { resetAuthSlice } from '@R/slices/auth/auth';
import { resetLanguageSlice } from '@R/slices/language/language';
import { resetLocationSlice } from '@R/slices/location/location';
import { resetMainFeedSlice } from '@R/slices/main-feed/main-feed';
import { resetNetworkSlice } from '@R/slices/network/network';
import { resetProfileSlice } from '@R/slices/profile/profile';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { DELETE_ACCOUNT } from './const';
import SettingsRow from '../settings-row/settings-row';

export default function DeleteAccountBtn() {
  const { language } = useAppSelector(({ language }) => language);
  const { userId } = useAppSelector(({ auth }) => auth);
  const dispatch = useAppDispatch();
  const [deleteAccount] = useDeleteUserMutation();
  const { replace } = useRouter();

  async function deleteUserHandler() {
    return await deleteAccount({ userId })
      .unwrap()
      .then(async () => {
        dispatch(resetProfileSlice());
        dispatch(resetActivitySlice());
        dispatch(resetMainFeedSlice());
        dispatch(resetAuthSlice());
        dispatch(resetNetworkSlice());
        dispatch(resetLanguageSlice());
        dispatch(resetLocationSlice());
        replace('/sign-in');
      })
      .catch((error) => showCrossPlatformToast(error))
      .finally();
  }

  return (
    <SettingsRow
      icon="delete-outline"
      title={DELETE_ACCOUNT[language].action}
      destructive
      onPress={async () => {
        if (Platform.OS !== 'web') {
          Alert.alert(
            DELETE_ACCOUNT[language].deletingAccount,
            DELETE_ACCOUNT[language].conscentDeleting,
            [
              {
                text: DELETE_ACCOUNT[language].sure,
                onPress: deleteUserHandler,
                style: 'cancel',
              },
            ],
            { cancelable: true },
          );
        } else {
          await deleteUserHandler();
        }
      }}
    />
  );
}
