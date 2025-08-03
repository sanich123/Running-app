import { resetFinishedActivity } from '@R/slices/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { DECLINE_BTN } from './const';
import { resetAdditionaInfoActivitySlice } from '@R/slices/actitivity-additional-info/activity-additional-info';
import { resetManualActivitySlice } from '@R/slices/manual-activity/manual-activity';

export default function DeclineBtn({ isDisabled }: { isDisabled: boolean }) {
  const dispatch = useAppDispatch();
  const { replace } = useRouter();
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
                dispatch(resetAdditionaInfoActivitySlice());
                dispatch(resetFinishedActivity());
                dispatch(resetManualActivitySlice());
                replace('/');
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
