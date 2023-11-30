import { resetActivityInfo, resetFinishedActivity, resetManualData } from '@R/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { Button } from 'react-native-paper';

import { DECLINE_BTN } from './const';

export default function DeclineBtn({ isDisabled }: { isDisabled: boolean }) {
  const dispatch = useAppDispatch();
  const { push } = useRouter();
  const { isDisabledWhileSending } = useAppSelector(({ activity }) => activity);
  const { language } = useAppSelector(({ language }) => language);

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
      {DECLINE_BTN[language].cancel}
    </Button>
  );
}
