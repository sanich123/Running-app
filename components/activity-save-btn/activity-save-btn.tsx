import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ToastAndroid } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { useAuth } from '../../auth/context/auth-context';
import { setIsDisableWhileSending } from '../../redux/activity/activity';
import { useAddActivityByUserIdMutation } from '../../redux/runich-api/runich-api';

export default function ActivitySaveBtn() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { push } = useRouter();
  const { finishedActivity } = useSelector(({ location }) => location);
  const { additionalInfo } = useSelector(({ activity }) => activity);
  const [sendActivity, { isLoading, error, data }] = useAddActivityByUserIdMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isLoading) {
      dispatch(setIsDisableWhileSending(true));
    }
    if (data) {
      dispatch(setIsDisableWhileSending(false));
      console.log(data);
      push('/home/');
    }
    if (error) {
      dispatch(setIsDisableWhileSending(false));
      console.log(error);
      ToastAndroid.show('An error occured during sending activity! Try again.', ToastAndroid.LONG);
    }
  }, [isLoading, data, error]);
  return (
    <Pressable
      onPress={async () => await sendActivity({ body: { ...finishedActivity, ...additionalInfo }, id: user.id })}
      disabled={isLoading}>
      <Text variant="titleMedium" style={{ color: colors.primaryContainer, marginRight: 15 }}>
        {`Sav${isLoading ? 'ing' : 'e'}`}
      </Text>
    </Pressable>
  );
}
