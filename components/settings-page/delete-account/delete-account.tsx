import { useEffect } from 'react';
import { Button } from 'react-native-paper';
import { supabase } from '@A/supabase/supabase-init';
import { useAuth } from '@A/context/auth-context';
import { useDeleteUserByUserIdMutation } from '@R/runich-api/runich-api';
import { Alert } from 'react-native';
import { useAppDispatch } from '@R/typed-hooks';
import { resetSettings } from '@R/profile/profile';
import { resetLocationsFromBackground } from '@R/location/location';

export default function DeleteAccountBtn() {
  const dispatch = useAppDispatch();
  const { user, signOut } = useAuth();
  const [deleteAccount, { isSuccess: isSuccessDeleting }] = useDeleteUserByUserIdMutation();

  useEffect(() => {
    if (isSuccessDeleting) {
      signOut?.();
    }
  }, [isSuccessDeleting, signOut]);
  
  return (
    <Button
      mode="outlined"
      icon="logout"
      onPress={async () => {
        Alert.alert(
          'Удаление аккаунта',
          'Удалится аккаунт и все связанные данные. Вы уверены?',
          [
            {
              text: 'Да, я все знаю',
              onPress: async () => {
                const { data } = await supabase.storage.from('photos').list(`${user?.id}`);
                if (data) {
                  const mappedUrlsToRemove = data?.map(({ name }) => `${user?.id}/${name}`);
                  await supabase.storage.from('photos').remove(mappedUrlsToRemove);
                  deleteAccount(`${user?.id}`).unwrap();
                  dispatch(resetSettings())
                  dispatch(resetLocationsFromBackground());
                }
              },
              style: 'cancel',
            },
          ],
          { cancelable: true },
        );
      }}>
      Удалить аккаунт
    </Button>
  );
}
