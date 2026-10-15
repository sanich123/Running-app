import { useGetUserProfileByUserIdQuery, useUpdateProfileByUserIdMutation } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { SETTINGS } from '../const';
import { EMAIL_NOTIFICATIONS_COPY } from './const';

export function useEmailNotifications(compact: boolean) {
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const { data: profileInfo, isSuccess } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
  const [updateProfile] = useUpdateProfileByUserIdMutation();
  const isEnabled = Boolean(profileInfo?.emailNotifications);

  const toggleEmailNotifications = async () => {
    if (!profileInfo) return;
    try {
      await updateProfile({ body: { emailNotifications: !isEnabled }, id: userId }).unwrap();
    } catch (error) {
      errorToast(EMAIL_NOTIFICATIONS_COPY[language].updateError, error);
    }
  };

  return {
    description:
      compact || !profileInfo
        ? undefined
        : `${isEnabled ? SETTINGS[language].switchOff : SETTINGS[language].switchOn} ${SETTINGS[language].emailNotifications}`,
    isEnabled,
    isVisible: Boolean(isSuccess && profileInfo),
    title: compact ? EMAIL_NOTIFICATIONS_COPY[language].compactTitle : EMAIL_NOTIFICATIONS_COPY[language].fullTitle,
    toggleEmailNotifications,
  };
}
