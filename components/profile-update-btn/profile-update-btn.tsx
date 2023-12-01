import { useAuth } from '@A/context/auth-context';
import { resetSettings, setIsDisabledWhileSendingProfile } from '@R/profile/profile';
import { useSendProfileInfoMutation, runichApi } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ToastAndroid } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { UPDATE_BTN_ERROR_MSG, UPDATE_BTN } from './const';

export default function ProfileUpdateBtn() {
  const dispatch = useAppDispatch();
  const { push } = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { settings } = useAppSelector(({ profile }) => profile);
  const { language } = useAppSelector(({ language }) => language);
  const [sendProfile, { isLoading, data, error }] = useSendProfileInfoMutation();

  useEffect(() => {
    if (data) {
      if (!process.env.IS_TESTING) {
        console.log(data);
      }
      dispatch(setIsDisabledWhileSendingProfile(false));
      dispatch(resetSettings());
      push('/(tabs)/profile');
    }
    if (error) {
      dispatch(setIsDisabledWhileSendingProfile(false));
      dispatch(runichApi.util.resetApiState());
      ToastAndroid.show(UPDATE_BTN_ERROR_MSG, ToastAndroid.LONG);
    }
  }, [data, error]);

  return (
    <Pressable
      onPress={async () => {
        dispatch(setIsDisabledWhileSendingProfile(true));
        if (user) {
          await sendProfile({ body: settings, id: user.id }).unwrap();
        }
      }}
      disabled={isLoading}>
      <Text variant="titleMedium" style={{ color: colors.primaryContainer, marginRight: 15 }}>
        {isLoading ? UPDATE_BTN[language].updating : UPDATE_BTN[language].update}
      </Text>
    </Pressable>
  );
}
