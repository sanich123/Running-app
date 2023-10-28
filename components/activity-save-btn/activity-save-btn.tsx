import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { useAuth } from '../../auth/context/auth-context';
import { resetAcitivityInfo, setIsDisableWhileSending, setIsNeedToResetInputs } from '../../redux/activity/activity';
import { useAddActivityByUserIdMutation } from '../../redux/runich-api/runich-api';

export default function ActivitySaveBtn() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { push } = useRouter();
  const { finishedActivity } = useSelector(({ location }) => location);
  const { additionalInfo, isDisabledWhileSending } = useSelector(({ activity }) => activity);
  const [sendActivity, { error, data }] = useAddActivityByUserIdMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (data) {
      console.log(data);
      push('/home/');
      dispatch(setIsDisableWhileSending(false));
      dispatch(resetAcitivityInfo());
      dispatch(setIsNeedToResetInputs(true));
    }
    if (error) {
      dispatch(setIsDisableWhileSending(false));
      console.log(error);
      // ToastAndroid.show('An error occured during sending activity! Try again.', ToastAndroid.LONG);
    }
  }, [data, error]);

  return (
    <Pressable
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
        {`Sav${isDisabledWhileSending ? 'ing' : 'e'}`}
      </Text>
    </Pressable>
  );
}
