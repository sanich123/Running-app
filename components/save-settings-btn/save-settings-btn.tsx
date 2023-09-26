import { useAuth } from '@auth/context/auth-context';
import { useSendProfileInfoMutation } from '@r/runnich-api/runnich-api';
import { SaveSettingsContext } from '@u/context/settings';
import { errorHandler } from '@u/error-handler';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Button } from 'react-native-paper';

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
