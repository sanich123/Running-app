import { useContext } from 'react';
import { ToastAndroid } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch } from 'react-redux';

import { useAuth } from '../../auth/context/auth-context';
import { checkIfProfileExist, insertUserProfile, updateUserProfile } from '../../auth/supabase/db-funcs/edit-profile';
import { saveSettingsInfo } from '../../redux/user-info-slice/user-info-slice';
import { SaveSettingsContext } from '../../utils/context/settings';
import { errorHandler } from '../../utils/error-handler';

export default function SaveSettingsBtn() {
  const dispatch = useDispatch();
  const {
    isDisabled,
    setIsDisabled,
    setIsLoading,
    photoUrl,
    gender,
    sport,
    name,
    surname,
    city,
    weight,
    bio,
    birthday,
    isLoading,
  } = useContext(SaveSettingsContext);
  const { user } = useAuth();

  return (
    <Button
      mode="outlined"
      style={{ width: 130, position: 'absolute', top: 15, right: 15 }}
      onPress={async () => {
        try {
          setIsDisabled(true);
          setIsLoading(true);
          const userSettings = {
            user_id: user.id,
            gender,
            sport,
            name,
            surname,
            city,
            weight,
            bio,
            birthday: birthday ? new Date(birthday) : null,
            profile_photo: photoUrl,
          };
          dispatch(saveSettingsInfo({ ...userSettings }));

          const profileAccount = await checkIfProfileExist(user.id);
          if (!profileAccount.length) {
            await insertUserProfile(user.id, userSettings);
            ToastAndroid.show('Profile created!', ToastAndroid.SHORT);
          } else {
            await updateUserProfile(user.id, userSettings);
            ToastAndroid.show('Profile updated!', ToastAndroid.SHORT);
          }
          setIsDisabled(false);
          setIsLoading(false);
        } catch (error) {
          setIsDisabled(false);
          setIsLoading(false);
          errorHandler(error);
        }
      }}
      loading={isLoading}
      disabled={isDisabled}>
      {`Sav${isLoading ? 'ing' : 'e'}`}
    </Button>
  );
}
