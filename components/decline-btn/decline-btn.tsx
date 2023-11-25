import { resetActivityInfo, resetFinishedActivity, resetManualData } from '@R/activity/activity';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { DECLINE_BTN } from './const';

export default function DeclineBtn({ isDisabled }: { isDisabled: boolean }) {
  const dispatch = useDispatch();
  const { push } = useRouter();
  const { isDisabledWhileSending } = useSelector(({ activity }) => activity);
  const { language } = useSelector(({ language }) => language);

  return (
    <Button
      icon="delete-outline"
      mode="outlined"
      onPress={() => {
        Alert.alert(
          DECLINE_BTN[language as keyof typeof DECLINE_BTN].action,
          DECLINE_BTN[language as keyof typeof DECLINE_BTN].question,
          [
            {
              text: DECLINE_BTN[language as keyof typeof DECLINE_BTN].accept,
              onPress: () => {
                dispatch(resetActivityInfo());
                dispatch(resetFinishedActivity());
                dispatch(resetManualData());
                push('/home');
              },
              style: 'cancel',
            },
          ],
          { cancelable: true },
        );
      }}
      style={{ marginTop: 15 }}
      disabled={isDisabled || isDisabledWhileSending}>
      {DECLINE_BTN[language as keyof typeof DECLINE_BTN].cancel}
    </Button>
  );
}
