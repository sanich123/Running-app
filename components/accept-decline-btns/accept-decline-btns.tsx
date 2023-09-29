import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { ToastAndroid, Alert } from 'react-native';
import { Button } from 'react-native-paper';

import { SaveActivityContext } from '../../utils/context/save-activity';

export default function AcceptDeclineBtns() {
  const { isDisabled } = useContext(SaveActivityContext);
  const router = useRouter();

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
  );
}
