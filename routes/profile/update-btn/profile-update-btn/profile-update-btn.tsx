import { StyleSheet } from 'react-native';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { Button, Text, useTheme } from 'react-native-paper';
import { useGetUserProfileByUserIdQuery, useUpdateProfileByUserIdMutation } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import {
  getProfileFormValues,
  type ProfileSettingsSearchParams,
} from '@Routes/profile/profile-settings/profile-settings-params';
import { errorToast, getErrorMessageFromError } from '@S/error-toast/error-toast';
import { UPDATE_BTN } from '../const';
import type { ProfileSettings } from '@R/services/profile/types';

export default function ProfileUpdateBtn() {
  const { back } = useRouter();
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const formValuesFromRoute = getProfileFormValues(useGlobalSearchParams() as Partial<ProfileSettingsSearchParams>);
  const { language } = useAppSelector(({ settings }) => settings);
  const { data: profile, isLoading: isProfileLoading } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileByUserIdMutation();
  const isSaving = isProfileLoading || isUpdating;

  return (
    <Button
      compact
      loading={isSaving}
      onPress={async () => {
        if (!userId) {
          errorToast('', 'Не удалось определить пользователя');
          return;
        }

        const body: ProfileSettings = {
          ...formValuesFromRoute,
          profilePhoto: profile?.profilePhoto ?? '',
        };

        try {
          await updateProfile({ body, id: userId }).unwrap();
          back();
        } catch (error) {
          errorToast('', getErrorMessageFromError(error));
        }
      }}
      disabled={isSaving}
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
  },
});
