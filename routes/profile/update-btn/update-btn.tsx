import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Text, useTheme } from 'react-native-paper';
import { useGetUserProfileByUserIdQuery, useUpdateProfileByProfileIdMutation } from '@R/services/profile/profile';
import { resetSettings, setIsDisabledWhileSendingProfile } from '@R/slices/profile/profile';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast, getErrorMessageFromError } from '@S/error-toast/error-toast';
import { UPDATE_BTN } from './const';
import type { ProfileSettings } from '@R/slices/profile/types';

export default function ProfileUpdateBtn() {
  const dispatch = useAppDispatch();
  const { back } = useRouter();
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { settings, isDisabledWhileSendingProfile } = useAppSelector(({ profile }) => profile);
  const { language } = useAppSelector(({ language }) => language);
  const { data: profile, isLoading: isProfileLoading } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileByProfileIdMutation();
  const isSaving = isProfileLoading || isUpdating;

  return (
    <Button
      compact
      loading={isSaving}
      onPress={async () => {
        dispatch(setIsDisabledWhileSendingProfile(true));
        const body = Object.fromEntries(
          Object.entries(settings).filter(([, value]) => value !== null),
        ) as ProfileSettings;

        if (body.birthday) {
          body.birthday = new Date(body.birthday).toISOString();
        }

        await updateProfile({ body, id: `${profile?.id}` })
          .unwrap()
          .then(() => {
            dispatch(resetSettings());
            back();
          })
          .catch((error) => {
            dispatch(setIsDisabledWhileSendingProfile(false));
            errorToast('', getErrorMessageFromError(error));
          })
          .finally(() => dispatch(setIsDisabledWhileSendingProfile(false)));
      }}
      disabled={isSaving || isDisabledWhileSendingProfile}
      style={styles.layout}>
      {!isSaving && (
        <Text variant="titleMedium" style={{ color: colors.primary }}>
          {UPDATE_BTN[language].update}
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
