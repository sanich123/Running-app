import { TouchableRipple, useTheme, Text, Divider } from 'react-native-paper';
import { Alert, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { resetProfileSlice } from '@R/slices/profile/profile';
import { resetLocationSlice } from '@R/slices/location/location';
import { DELETE_ACCOUNT } from './const';
import { useDeleteUserMutation } from '@R/services/authentication/authentication';
import { showCrossPlatformToast } from '@U/custom-toast';
import { resetActivitySlice } from '@R/slices/activity/activity';
import { resetMainFeedSlice } from '@R/slices/main-feed/main-feed';
import { resetAuthSlice } from '@R/slices/auth/auth';
import { resetNetworkSlice } from '@R/slices/network/network';
import { resetLanguageSlice } from '@R/slices/language/language';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function DeleteAccountBtn() {
  const { language } = useAppSelector(({ language }) => language);
  const { userId } = useAppSelector(({ auth }) => auth);
  const dispatch = useAppDispatch();
  const { dark, colors } = useTheme();
  const [deleteAccount] = useDeleteUserMutation();
  const { replace } = useRouter();

  return (
    <>
      <TouchableRipple
        rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
        borderless
        onPress={async () => {
          Alert.alert(
            DELETE_ACCOUNT[language].deletingAccount,
            DELETE_ACCOUNT[language].conscentDeleting,
            [
              {
                text: DELETE_ACCOUNT[language].sure,
                onPress: async () => {
                  deleteAccount({ userId })
                    .unwrap()
                    .then(async () => {
                      await AsyncStorage.removeItem('accessToken');
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
                },
                style: 'cancel',
              },
            ],
            { cancelable: true },
          );
        }}>
        <View style={{ display: 'flex', backgroundColor: colors.background, justifyContent: 'center', padding: 10 }}>
          <Text variant="titleMedium">{DELETE_ACCOUNT[language].action}</Text>
        </View>
      </TouchableRipple>
      <Divider />
    </>
  );
}
