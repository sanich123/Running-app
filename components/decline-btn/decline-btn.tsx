import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { DECLINE_BTN } from './const';

export default function DeclineBtn({ isDisabled }: { isDisabled: boolean }) {
  const { push } = useRouter();
  const { isDisabledWhileSending } = useSelector(({ activity }) => activity);
  const { language } = useSelector(({ language }) => language);

  return (
    <Button
      icon="delete-outline"
      mode="outlined"
      onPress={() => {
        Alert.alert(
          DECLINE_BTN[language].action,
          DECLINE_BTN[language].question,
          [
            {
              text: DECLINE_BTN[language].accept,
              onPress: () => push('/home'),
              style: 'cancel',
            },
          ],
          { cancelable: true },
        );
      }}
      style={{ marginTop: 15 }}
      disabled={isDisabled || isDisabledWhileSending}>
      {DECLINE_BTN[language].cancel}
    </Button>
  );
}
