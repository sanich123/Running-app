import { useGetUserProfileByUserIdQuery, useUpdateProfileByUserIdMutation } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import { NOTIFICATION_COPY } from '@Routes/notifications/constants';
import { getNotificationLocale } from '@Routes/notifications/helpers';
import { errorToast } from '@S/error-toast/error-toast';
import type { ProfileSettings } from '@R/services/profile/types';

export function useGroupNotificationPreferences() {
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const copy = NOTIFICATION_COPY[getNotificationLocale(language)];
  const { updateSettingError } = copy;
  const { data: profile, isSuccess } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
  const [updateProfile, { isLoading }] = useUpdateProfileByUserIdMutation();

  const savePreference = async (
    body: Pick<ProfileSettings, 'groupPostsNotifications' | 'groupEventsNotifications'>,
  ) => {
    if (!userId) return;
    try {
      await updateProfile({ body, id: userId }).unwrap();
    } catch (error) {
      errorToast(updateSettingError, error);
    }
  };

  return {
    canUpdate: Boolean(userId && isSuccess),
    copy,
    groupEventsEnabled: profile?.groupEventsNotifications !== false,
    groupPostsEnabled: profile?.groupPostsNotifications !== false,
    isLoading: !isSuccess,
    isUpdating: isLoading,
    toggleGroupEvents: (enabled: boolean) => savePreference({ groupEventsNotifications: enabled }),
    toggleGroupPosts: (enabled: boolean) => savePreference({ groupPostsNotifications: enabled }),
  };
}
