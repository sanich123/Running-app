import { useLinkTo } from '@react-navigation/native';
import { ToastAndroid, Alert } from 'react-native';
import { Button } from 'react-native-paper';

import { setToAsyncStorage } from '../../utils/async-storage-utils';

type AcceptDeclineBtnsProps = {
  title: string;
  description: string;
  sport: string;
  emotion: string;
  isSwitchOn: boolean;
};
export default function AcceptDeclineBtns({ title, description, sport, emotion, isSwitchOn }: AcceptDeclineBtnsProps) {
  const linkTo = useLinkTo();
  return (
    <>
      <Button
        icon="hand-okay"
        mode="contained"
        onPress={async () => {
          const savedData = { title, description, sport, emotion, isSwitchOn };
          setToAsyncStorage('userData', savedData);
          ToastAndroid.show('Successfully saved data!', ToastAndroid.SHORT);
          linkTo('/');
        }}
        style={{ marginTop: 15 }}>
        Save
      </Button>
      <Button
        icon="delete-outline"
        mode="outlined"
        onPress={async () => {
          Alert.alert(
            'Deleting',
            'Are you sure?',
            [
              {
                text: 'Fucking yes',
                onPress: () => {
                  ToastAndroid.show('Redirecting to the main page!', ToastAndroid.SHORT);
                  linkTo('/');
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
