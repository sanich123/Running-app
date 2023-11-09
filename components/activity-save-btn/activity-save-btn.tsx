import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ToastAndroid } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { ACTIVITY_SAVE_BTN, ACTIVITY_SAVE_BTN_TEST_ID } from './const';
import { useAuth } from '../../auth/context/auth-context';
import { resetActivityInfo, setIsDisableWhileSending, setIsNeedToResetInputs } from '../../redux/activity/activity';
import { useAddActivityByUserIdMutation } from '../../redux/runich-api/runich-api';

export default function ActivitySaveBtn() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { push } = useRouter();
  const { finishedActivity } = useSelector(({ location }) => location);
  const { additionalInfo, isDisabledWhileSending } = useSelector(({ activity }) => activity);
  const { language } = useSelector(({ language }) => language);
  const [sendActivity, { error, data }] = useAddActivityByUserIdMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (data) {
      push('/home/');
      dispatch(setIsDisableWhileSending(false));
      dispatch(resetActivityInfo());
      dispatch(setIsNeedToResetInputs(true));
    }
    if (error) {
      dispatch(setIsDisableWhileSending(false));
      console.log(error);
      ToastAndroid.show(ACTIVITY_SAVE_BTN[language].errorMsg, ToastAndroid.LONG);
    }
  }, [data, error]);

  return (
    <Pressable
      testID={ACTIVITY_SAVE_BTN_TEST_ID}
      onPress={async () => {
        dispatch(setIsDisableWhileSending(true));
        await sendActivity({
          body: { ...finishedActivity, ...additionalInfo },
          id: user.id,
        }).unwrap();
      }}
      disabled={isDisabledWhileSending}>
      <Text
        variant="titleMedium"
        style={{ color: colors.primaryContainer, marginRight: 15, opacity: isDisabledWhileSending ? 0.5 : 1 }}>
        {isDisabledWhileSending ? ACTIVITY_SAVE_BTN[language].saving : ACTIVITY_SAVE_BTN[language].save}
      </Text>
    </Pressable>
  );
}
