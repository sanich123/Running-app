import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Text, useTheme } from 'react-native-paper';
import { useGetUserProfileByUserIdQuery, useUpdateProfileByUserIdMutation } from '@R/services/profile/profile';
import { resetSettings, setIsDisabledWhileSendingProfile } from '@R/slices/profile/profile';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import {
  useProfileFormParams,
  type ProfileFormValues,
} from '@Routes/profile/profile-settings/profile-settings-params';
import { errorToast, getErrorMessageFromError } from '@S/error-toast/error-toast';
import { UPDATE_BTN } from './const';
import type { ProfileSettings } from '@R/slices/profile/types';

interface ProfileUpdateBtnProps {
  formValues?: ProfileFormValues;
}

export default function ProfileUpdateBtn({ formValues: formValuesFromLayout }: ProfileUpdateBtnProps) {
  const dispatch = useAppDispatch();
  const { back } = useRouter();
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { settings, isDisabledWhileSendingProfile } = useAppSelector(({ profile }) => profile);
  const formValuesFromRoute = useProfileFormParams();
  const formValues = formValuesFromLayout ?? formValuesFromRoute;
  const { language } = useAppSelector(({ settings }) => settings);
  const { isLoading: isProfileLoading } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileByUserIdMutation();
  const isSaving = isProfileLoading || isUpdating;

  return (
    <Button
      compact
      loading={isSaving}
      onPress={async () => {
        dispatch(setIsDisabledWhileSendingProfile(true));
        const body: ProfileSettings = { ...formValues, profilePhoto: settings.profilePhoto };

        if (!userId) {
          dispatch(setIsDisabledWhileSendingProfile(false));
          errorToast('', 'Не удалось определить пользователя');
          return;
        }

        await updateProfile({ body, id: userId })
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
  },
});
