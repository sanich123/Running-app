import { useLinkTo } from '@react-navigation/native';
import { useState } from 'react';
import { ToastAndroid, Alert } from 'react-native';
import { Button } from 'react-native-paper';

import { useAppSelector } from '../../redux/hooks/hooks';
import { getFromAsyncStorage, setToAsyncStorage } from '../../utils/async-storage-utils';
import { errorHandler } from '../../utils/error-handler';

type AcceptDeclineBtnsProps = {
  title: string;
  description: string;
  sport: string;
  emotion: string;
  isSwitchOn: boolean;
};
export default function AcceptDeclineBtns({ title, description, sport, emotion, isSwitchOn }: AcceptDeclineBtnsProps) {
  const linkTo = useLinkTo();
  const [isLoading, setIsLoading] = useState(false);
  const { finishedActivity } = useAppSelector(({ location }) => location);
  async function submitHandler() {
    try {
      setIsLoading(true);
      const dataToSave = { ...finishedActivity, title, description, sport, emotion, isSwitchOn };
      await setToAsyncStorage('userData', dataToSave);
      const savedInStorageData = await getFromAsyncStorage('userData');
      console.log(savedInStorageData);
      ToastAndroid.show('Successfully saved data!', ToastAndroid.SHORT);
      linkTo('/home');
      setIsLoading(false);
    } catch (error) {
      errorHandler(error);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <>
      <Button icon="hand-okay" mode="contained" onPress={submitHandler} loading={isLoading} style={{ marginTop: 15 }}>
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
                  linkTo('/home');
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
        style={{ marginTop: 15 }}>
        Discard
      </Button>
    </>
  );
}
