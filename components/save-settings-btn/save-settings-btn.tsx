import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Button } from 'react-native-paper';

import { useAuth } from '../../auth/context/auth-context';
import { useSendProfileInfoMutation } from '../../redux/runnich-api/runnich-api';
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

  return (
    <Button
      mode="outlined"
      style={{ width: 130, position: 'absolute', top: 15, right: 15 }}
      onPress={async () => {
        try {
          setIsDisabled(true);
          setIsLoading(true);
          const userSettings = {
            gender,
            sport,
            name,
            surname,
            city,
            weight,
            bio,
            birthday: birthday ? new Date(birthday) : null,
            profilePhoto: photoUrl ? photoUrl : image,
          };

          await sendProfileInfo({ body: userSettings, id: user.id })
            .unwrap()
            .then(() => router.back())
            .catch((error) => errorHandler(error));
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
