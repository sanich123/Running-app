import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';

import { errorHandler } from './error-handler';
import useGetSettings from './hooks/use-get-settings';
import { useAuth } from '../auth/context/auth-context';
import { useSendProfileInfoMutation } from '../redux/runich-api/runnich-api';
import { saveSettingsInfo, setIsNeedUpdateProfile } from '../redux/user-info-slice/user-info-slice';

export async function SendProfile() {
  const { gender, sport, name, surname, city, weight, bio, birthday, image, photoUrl, setIsLoading, setIsDisabled } =
    useGetSettings();
  const dispatch = useDispatch();
  const [sendProfileInfo] = useSendProfileInfoMutation();
  const { user } = useAuth();
  const router = useRouter();
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
    setIsDisabled(true);
    setIsLoading(true);
    dispatch(saveSettingsInfo(userSettings));
    return await sendProfileInfo({
      body: { ...userSettings, birthday: birthday ? new Date(birthday) : null },
      id: user.id,
    })
      .unwrap()
      .then((data) => {
        console.log(data);
        router.back();
        dispatch(setIsNeedUpdateProfile(false));
      })
      .catch((error) => errorHandler(error))
      .finally(() => {
        setIsDisabled(false);
        setIsLoading(false);
      });
  } catch (error) {
    errorHandler(error);
  }
}
