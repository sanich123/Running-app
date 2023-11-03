import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { ToastAndroid, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { SaveActivityContext } from '../../utils/context/save-activity';

export default function DeclineBtn() {
  const { isDisabled } = useContext(SaveActivityContext);
  const { push } = useRouter();
  const { isDisabledWhileSending } = useSelector(({ activity }) => activity);
  return (
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
                push('/home');
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
      disabled={isDisabled || isDisabledWhileSending}>
      Discard
    </Button>
  );
}
