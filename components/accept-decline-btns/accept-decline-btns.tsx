import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ToastAndroid, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { useAddActivityByUserIdMutation } from '../../redux/runnich-api/runnich-api';
import { SaveActivityContext } from '../../utils/context/save-activity';
import { errorHandler } from '../../utils/error-handler';

export default function AcceptDeclineBtns() {
  const { id } = useSelector(({ userInfo }) => userInfo);
  const [sendActivity, { error, data }] = useAddActivityByUserIdMutation();
  const { title, description, sport, emotion, isSwitchOn, photoUrl, isDisabled, setIsDisabled } =
    useContext(SaveActivityContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { finishedActivity } = useSelector(({ location }) => location);
  useEffect(() => {
    if (data) {
      console.log(data);
      ToastAndroid.show('Successfully sended data to server!', ToastAndroid.SHORT);
      router.replace('/(tabs)/home/');
    }
    if (error) {
      ToastAndroid.show('Some error occured', ToastAndroid.SHORT);
      console.log(error);
      setIsDisabled(false);
      setIsLoading(false);
    }
  }, [data, error]);

  async function submitHandler() {
    try {
      setIsDisabled(true);
      setIsLoading(true);
      const body = { ...finishedActivity, title, description, sport, emotion, isSwitchOn, photoUrl };
      await sendActivity({ body, id }).unwrap();
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
