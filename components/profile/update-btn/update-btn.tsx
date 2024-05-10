import { useAuth } from '@A/context/auth-context';
import { resetSettings, setIsDisabledWhileSendingProfile } from '@R/profile/profile';
import { useSendProfileInfoMutation, runichApi } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { ToastDuration, showCrossPlatformToast } from '@U/custom-toast';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

import { UPDATE_BTN_ERROR_MSG, UPDATE_BTN } from './const';

export default function ProfileUpdateBtn() {
  const dispatch = useAppDispatch();
  const { back } = useRouter();
  const { colors, dark } = useTheme();
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
      back();
    }
    if (error) {
      console.log(error);
      dispatch(setIsDisabledWhileSendingProfile(false));
      dispatch(runichApi.util.resetApiState());
      if (Platform.OS !== 'web') {
        showCrossPlatformToast(UPDATE_BTN_ERROR_MSG, ToastDuration.short);
      }
    }
  }, [data, error]);

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      onPress={async () => {
        dispatch(setIsDisabledWhileSendingProfile(true));
        if (user) {
          await sendProfile({ body: settings, id: user.id }).unwrap();
        }
      }}
      borderless
      disabled={isLoading}
      style={{ padding: 5, borderRadius: 10 }}>
      <Text variant="titleMedium" style={{ color: colors.primary, marginRight: 15 }}>
        {isLoading ? UPDATE_BTN[language].updating : UPDATE_BTN[language].update}
      </Text>
    </TouchableRipple>
  );
}
