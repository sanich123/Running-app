import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ToastAndroid } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

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
  useEffect(() => {
    if (isLoading) {
      dispatch(setIsDisabledWhileSendingProfile(true));
    }
    if (data) {
      console.log(data);
      dispatch(setIsDisabledWhileSendingProfile(false));
      push('/(tabs)/profile');
    }
    if (error) {
      dispatch(setIsDisabledWhileSendingProfile(false));
      ToastAndroid.show('An error occured during sending profile info. Try again!', ToastAndroid.LONG);
    }
  }, [isLoading, data, error]);
  return (
    <Pressable
      onPress={async () => {
        const birthday = settings.birthday ? new Date(settings.birthday) : null;
        console.log({ body: { ...settings, birthday } });
        // await sendProfile({
        //   body: { ...settings, birthday },
        //   id: user.id,
        // }).unwrap();
      }}
      disabled={isLoading}>
      <Text variant="titleMedium" style={{ color: colors.primaryContainer, marginRight: 15 }}>
        {`Updat${isLoading ? 'ing' : 'e'}`}
      </Text>
    </Pressable>
  );
}
