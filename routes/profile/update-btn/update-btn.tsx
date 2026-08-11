import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Text, useTheme } from 'react-native-paper';
import {
  useCreateProfileByUserIdMutation,
  useGetUserProfileByUserIdQuery,
  useUpdateProfileByProfileIdMutation,
} from '@R/services/profile/profile';
import { resetSettings, setIsDisabledWhileSendingProfile } from '@R/slices/profile/profile';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { UPDATE_BTN_ERROR_MSG, UPDATE_BTN } from './const';

export default function ProfileUpdateBtn() {
  const dispatch = useAppDispatch();
  const { back } = useRouter();
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { settings, isDisabledWhileSendingProfile } = useAppSelector(({ profile }) => profile);
  const { language } = useAppSelector(({ language }) => language);
  const { data: profile, isLoading: isProfileLoading } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
  const [createProfile, { isLoading: isCreating }] = useCreateProfileByUserIdMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileByProfileIdMutation();
  const isSaving = isProfileLoading || isCreating || isUpdating;

  return (
    <Button
      compact
      loading={isSaving}
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
            .catch((error) => {
              dispatch(setIsDisabledWhileSendingProfile(false));
              errorToast(UPDATE_BTN_ERROR_MSG, error);
            });
        } else {
          await updateProfile({ body: settings, id: `${profile?.id}` })
            .unwrap()
            .then(() => {
              dispatch(setIsDisabledWhileSendingProfile(false));
              dispatch(resetSettings());
              back();
            })
            .catch((error) => {
              dispatch(setIsDisabledWhileSendingProfile(false));
              errorToast(UPDATE_BTN_ERROR_MSG, error);
            });
        }
      }}
      disabled={isSaving || isDisabledWhileSendingProfile}
      style={styles.layout}>
      {!isSaving && (
        <Text variant="titleMedium" style={{ color: colors.primary }}>
          {profile?.id ? UPDATE_BTN[language].update : UPDATE_BTN[language].create}
        </Text>
      )}
    </Button>
  );
}

const styles = StyleSheet.create({
  layout: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 5,
  },
});
