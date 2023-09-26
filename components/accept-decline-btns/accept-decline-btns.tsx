import { useAuth } from '@auth/context/auth-context';
import { useAddActivityByUserIdMutation } from '@r/runnich-api/runnich-api';
import { SaveActivityContext } from '@u/context/save-activity';
import { errorHandler } from '@u/error-handler';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ToastAndroid, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useSelector } from 'react-redux';

export default function AcceptDeclineBtns() {
  const { user } = useAuth();
  const [sendActivity, { error, data }] = useAddActivityByUserIdMutation();
  const { title, description, sport, emotion, isSwitchOn, isDisabled, setIsDisabled, images } =
    useContext(SaveActivityContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { finishedActivity } = useSelector(({ location }) => location);

  useEffect(() => {
    if (data) {
      console.log(data);
      ToastAndroid.show('Successfully sended data to server!', ToastAndroid.SHORT);
      router.push('/(tabs)/home/');
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
      const body = { ...finishedActivity, title, description, sport, emotion, isSwitchOn, photoUrls: images };
      await sendActivity({ body, id: user.id }).unwrap();
    } catch (error) {
      errorHandler(error);
    } finally {
      setIsDisabled(false);
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
