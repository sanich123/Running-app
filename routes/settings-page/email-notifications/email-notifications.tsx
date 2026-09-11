import { Switch } from 'react-native-paper';
import { useGetUserProfileByUserIdQuery, useUpdateProfileByUserIdMutation } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { SETTINGS } from '../const';
import SettingsRow from '../settings-row/settings-row';

export default function EmailNotificationsBtn() {
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const { data: profileInfo, isSuccess } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
  const [updateProfile] = useUpdateProfileByUserIdMutation();

  return (
    <>
      {isSuccess && profileInfo && (
        <SettingsRow
          title={language === 'russian' ? 'Уведомления по почте' : 'Email notifications'}
          description={`${profileInfo.emailNotifications ? SETTINGS[language].switchOff : SETTINGS[language].switchOn} ${SETTINGS[language].emailNotifications}`}
          leading={
            <Switch
              testID="email-notifications-switch"
              value={!!profileInfo.emailNotifications}
              onValueChange={async () => {
                try {
                  await updateProfile({
                    body: { emailNotifications: !profileInfo.emailNotifications },
                    id: userId,
                  }).unwrap();
                } catch (error) {
                  errorToast('Не удалось изменить настройки уведомлений', error);
                }
              }}
            />
          }
        />
      )}
    </>
  );
}
