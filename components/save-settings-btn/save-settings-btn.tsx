import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Button } from 'react-native-paper';
import { useDispatch } from 'react-redux';

import { useAuth } from '../../auth/context/auth-context';
import { useSendProfileInfoMutation } from '../../redux/runnich-api/runnich-api';
import { saveSettingsInfo } from '../../redux/user-info-slice/user-info-slice';
import { SaveSettingsContext } from '../../utils/context/settings';
import { errorHandler } from '../../utils/error-handler';

export default function SaveSettingsBtn() {
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
    image,
  } = useContext(SaveSettingsContext);
  const { user } = useAuth();
  const [sendProfileInfo] = useSendProfileInfoMutation();
  const router = useRouter();
  const dispatch = useDispatch();

  return (
    <Button
      mode="outlined"
      style={{ width: 130, position: 'absolute', top: 15, right: 15 }}
      onPress={async () => {
        setIsDisabled(true);
        setIsLoading(true);
        try {
          const userSettings = {
            gender,
            sport,
            name,
            surname,
            city,
            weight,
            bio,
            birthday: birthday ? new Date(birthday).toString() : null,
            profilePhoto: photoUrl ? photoUrl : image,
          };
          dispatch(saveSettingsInfo(userSettings));
          await sendProfileInfo({
            body: { ...userSettings, birthday: birthday ? new Date(birthday) : null },
            id: user.id,
          })
            .unwrap()
            .then(() => router.back())
            .catch((error) => errorHandler(error))
            .finally(() => {
              setIsDisabled(false);
              setIsLoading(false);
            });
        } catch (error) {
          errorHandler(error);
        }
      }}
      loading={isLoading}
      disabled={isDisabled}>
      {`Sav${isLoading ? 'ing' : 'e'}`}
    </Button>
  );
}
