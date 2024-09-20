import { useEffect } from 'react';
import { TouchableRipple, useTheme, Text, Divider } from 'react-native-paper';
import { supabase } from '@A/supabase/supabase-init';
import { useAuth } from '@A/context/auth-context';
import { useDeleteUserByUserIdMutation } from '@R/runich-api/runich-api';
import { Alert, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { resetSettings } from '@R/profile/profile';
import { resetLocationsFromBackground } from '@R/location/location';
import { DELETE_ACCOUNT } from './const';

export default function DeleteAccountBtn() {
  const { language } = useAppSelector(({ language }) => language);
  const dispatch = useAppDispatch();
  const { user, signOut } = useAuth();
  const [deleteAccount, { isSuccess: isSuccessDeleting }] = useDeleteUserByUserIdMutation();
  const { dark, colors } = useTheme();
  useEffect(() => {
    if (isSuccessDeleting) {
      signOut?.();
    }
  }, [isSuccessDeleting, signOut]);

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
                  const { data } = await supabase.storage.from('photos').list(`${user?.id}`);
                  if (data) {
                    const mappedUrlsToRemove = data?.map(({ name }) => `${user?.id}/${name}`);
                    await supabase.storage.from('photos').remove(mappedUrlsToRemove);
                    deleteAccount(`${user?.id}`).unwrap();
                    dispatch(resetSettings());
                    dispatch(resetLocationsFromBackground());
                  }
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
