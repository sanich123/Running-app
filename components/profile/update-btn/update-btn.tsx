import { useAuth } from '@A/context/auth-context';
import { setIsNeedToRefreshActivities } from '@R/main-feed/main-feed';
import { resetSettings, setIsDisabledWhileSendingProfile } from '@R/profile/profile';
import { useSendProfileInfoMutation } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';

import { UPDATE_BTN_ERROR_MSG, UPDATE_BTN } from './const';

export default function ProfileUpdateBtn() {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { back } = useRouter();
  const { colors, dark } = useTheme();
  const { user } = useAuth();
  const { settings, isDisabledWhileSendingProfile } = useAppSelector(({ profile }) => profile);
  const { language } = useAppSelector(({ language }) => language);
  const [sendProfile, { isLoading, isSuccess, isError, error }] = useSendProfileInfoMutation();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setIsNeedToRefreshActivities(true));
      dispatch(setIsDisabledWhileSendingProfile(false));
      dispatch(resetSettings());
      back();
    }
    if (isError) {
      if (__DEV__) console.log(error);
      dispatch(setIsDisabledWhileSendingProfile(false));
      if (Platform.OS !== 'web') {
        showCrossPlatformToast(UPDATE_BTN_ERROR_MSG);
      } else {
        toast.show(UPDATE_BTN_ERROR_MSG);
      }
    }
  }, [isSuccess, error, isError, dispatch, back, toast]);

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      onPress={async () => {
        dispatch(setIsDisabledWhileSendingProfile(true));
        await sendProfile({ body: settings, id: `${user?.id}` }).unwrap();
      }}
      borderless
      disabled={isLoading || isDisabledWhileSendingProfile}
      style={styles.layout}>
      <Text variant="titleMedium" style={{ color: colors.primary }}>
        {isLoading ? UPDATE_BTN[language].updating : UPDATE_BTN[language].update}
      </Text>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  layout: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    borderRadius: 10,
    marginRight: 5,
  },
});
