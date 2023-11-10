import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ToastAndroid } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { UPDATE_BTN, UPDATE_BTN_ERROR_MSG } from './const';
import { useAuth } from '../../auth/context/auth-context';
import { setIsDisabledWhileSendingProfile } from '../../redux/profile/profile';
import { useSendProfileInfoMutation } from '../../redux/runich-api/runich-api';

export default function ProfileUpdateBtn() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { settings } = useSelector(({ profile }) => profile);
  const { push } = useRouter();
  const dispatch = useDispatch();
  const [sendProfile, { isLoading, data, error }] = useSendProfileInfoMutation();
  const { language } = useSelector(({ language }) => language);

  useEffect(() => {
    if (data) {
      if (!process.env.IS_TESTING) {
        console.log(data);
      }
      dispatch(setIsDisabledWhileSendingProfile(false));
      push('/(tabs)/profile');
    }
    if (error) {
      dispatch(setIsDisabledWhileSendingProfile(false));
      ToastAndroid.show(UPDATE_BTN_ERROR_MSG, ToastAndroid.LONG);
    }
  }, [data, error]);

  return (
    <Pressable
      onPress={async () => {
        dispatch(setIsDisabledWhileSendingProfile(true));
        await sendProfile({ body: settings, id: user.id }).unwrap();
      }}
      disabled={isLoading}>
      <Text variant="titleMedium" style={{ color: colors.primaryContainer, marginRight: 15 }}>
        {!isLoading && UPDATE_BTN[language].update}
        {isLoading && UPDATE_BTN[language].updating}
      </Text>
    </Pressable>
  );
}
