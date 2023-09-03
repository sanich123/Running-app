import { useRouter } from 'expo-router';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useContext, useEffect } from 'react';
import { ToastAndroid } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { FIREBASE_STORAGE } from '../../firebaseConfig';
import { useSendProfileInfoMutation } from '../../redux/runnich-api/runnich-api';
import { saveSettingsInfo } from '../../redux/user-info-slice/user-info-slice';
import { SaveSettingsContext } from '../../utils/context/settings';
import { errorHandler } from '../../utils/error-handler';
import { getBlobFromUri, getInfoFromUri } from '../../utils/file-sending';

export default function SaveSettingsBtn() {
  const { id } = useSelector(({ userInfo }) => userInfo);
  const [sendProfileInfo, { data, error }] = useSendProfileInfoMutation();
  const router = useRouter();
  const {
    isDisabled,
    setIsDisabled,
    setIsLoading,
    image,
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
  const dispatch = useDispatch();
  useEffect(() => {
    if (data) {
      ToastAndroid.show('Your data has successfully sended!', ToastAndroid.SHORT);
      console.log(data);
      router.back();
    }
    if (error) {
      ToastAndroid.show('An error occured', ToastAndroid.SHORT);
      console.log(error);
    }
  }, [error, data]);
  return (
    <Button
      mode="outlined"
      style={{ width: 200, marginLeft: 15, marginRight: 15 }}
      onPress={async () => {
        try {
          setIsDisabled(true);
          setIsLoading(true);
          let profilePhoto = '';
          if (image) {
            const blob = await getBlobFromUri(image);
            const fileName = getInfoFromUri(image);
            const storageRef = ref(FIREBASE_STORAGE, fileName);
            await uploadBytes(storageRef, blob as Blob, { contentType: 'image/jpeg' });
            ToastAndroid.show('Successfully upload photo', ToastAndroid.SHORT);
            profilePhoto = await getDownloadURL(storageRef);
            ToastAndroid.show('Url to file has successfully received', ToastAndroid.SHORT);
          }
          const userSettings = {
            gender,
            sport,
            name,
            surname,
            city,
            weight,
            bio,
            profilePhoto,
          };
          dispatch(saveSettingsInfo({ ...userSettings, birthday: birthday.toString() }));
          await sendProfileInfo({ ...userSettings, userId: id, birthday }).unwrap();
          setIsDisabled(false);
          setIsLoading(false);
        } catch (error) {
          setIsDisabled(false);
          setIsLoading(false);
          errorHandler(error);
        } finally {
          setIsLoading(false);
          setIsLoading(false);
        }
      }}
      loading={isLoading}
      disabled={isDisabled}>
      Save
    </Button>
  );
}
