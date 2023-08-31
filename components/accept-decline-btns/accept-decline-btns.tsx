import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ToastAndroid, Alert } from 'react-native';
import { Button } from 'react-native-paper';

import { useAppSelector } from '../../redux/hooks/hooks';
import { getFromAsyncStorage, setToAsyncStorage } from '../../utils/async-storage-utils';
import { SaveActivityContext } from '../../utils/context/save-activity';
import { errorHandler } from '../../utils/error-handler';

export default function AcceptDeclineBtns() {
  const { title, description, sport, emotion, isSwitchOn, photoUrl, isDisabled, setIsDisabled } =
    useContext(SaveActivityContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { finishedActivity } = useAppSelector(({ location }) => location);

  async function submitHandler() {
    try {
      setIsDisabled(true);
      setIsLoading(true);
      const dataToSave = { ...finishedActivity, title, description, sport, emotion, isSwitchOn, photoUrl };
      console.log(dataToSave);
      await setToAsyncStorage('userData', dataToSave);
      const savedInStorageData = await getFromAsyncStorage('userData');
      console.log(savedInStorageData);
      ToastAndroid.show('Successfully saved data!', ToastAndroid.SHORT);
      router.back();
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
  }
  return (
    <>
      <Button
        icon="hand-okay"
        mode="contained"
        onPress={submitHandler}
        loading={isLoading}
        style={{ marginTop: 15 }}
        disabled={isDisabled}>
        {`Sav${isLoading ? 'ing' : 'e'}`}
      </Button>
      <Button
        icon="delete-outline"
        mode="outlined"
        onPress={() => {
          Alert.alert(
            'Deleting',
            'Are you sure?',
            [
              {
                text: 'Fucking yes',
                onPress: () => {
                  ToastAndroid.show('Redirecting to the main page!', ToastAndroid.SHORT);
                  router.push('/home');
                },
                style: 'cancel',
              },
            ],
            {
              cancelable: true,
              onDismiss: () => ToastAndroid.show('Go change you data!', ToastAndroid.SHORT),
            },
          );
        }}
        style={{ marginTop: 15 }}
        disabled={isDisabled}>
        Discard
      </Button>
    </>
  );
}
