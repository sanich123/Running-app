import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import {
  useCreateProfileByUserIdMutation,
  useGetUserProfileByUserIdQuery,
  useUpdateProfileByProfileIdMutation,
} from '@R/services/profile/profile';
import { resetSettings, setIsDisabledWhileSendingProfile } from '@R/slices/profile/profile';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { UPDATE_BTN_ERROR_MSG, UPDATE_BTN } from './const';

export default function ProfileUpdateBtn() {
  const dispatch = useAppDispatch();
  const { back } = useRouter();
  const { colors, dark } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { settings, isDisabledWhileSendingProfile } = useAppSelector(({ profile }) => profile);
  const { language } = useAppSelector(({ language }) => language);
  const { data: profile } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
  const [createProfile, { isLoading: isCreating }] = useCreateProfileByUserIdMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileByProfileIdMutation();

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      onPress={async () => {
        dispatch(setIsDisabledWhileSendingProfile(true));
        if (!profile?.id) {
          await createProfile({ body: settings, id: userId })
            .unwrap()
            .then(() => {
              dispatch(setIsDisabledWhileSendingProfile(false));
              dispatch(resetSettings());
              back();
            })
            .catch(() => {
              dispatch(setIsDisabledWhileSendingProfile(false));
              showCrossPlatformToast(UPDATE_BTN_ERROR_MSG);
            });
        } else {
          await updateProfile({ body: settings, id: `${profile?.id}` })
            .unwrap()
            .then(() => {
              dispatch(setIsDisabledWhileSendingProfile(false));
              dispatch(resetSettings());
              back();
            })
            .catch(() => {
              dispatch(setIsDisabledWhileSendingProfile(false));
              showCrossPlatformToast(UPDATE_BTN_ERROR_MSG);
            });
        }
      }}
      borderless
      disabled={isCreating || isDisabledWhileSendingProfile || isUpdating}
      style={styles.layout}>
      <Text variant="titleMedium" style={{ color: colors.primary }}>
        {isCreating ? UPDATE_BTN[language].updating : UPDATE_BTN[language].update}
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
