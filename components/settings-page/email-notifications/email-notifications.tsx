import { Switch } from 'react-native-paper';
import { useGetUserProfileByUserIdQuery, useUpdateProfileByProfileIdMutation } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import { SETTINGS } from '../const';
import SettingsRow from '../settings-row/settings-row';

export default function EmailNotificationsBtn() {
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ language }) => language);
  const { data: profileInfo, isSuccess } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
  const [updateProfile] = useUpdateProfileByProfileIdMutation();

  return (
    <>
      {isSuccess && profileInfo && (
        <SettingsRow
          icon="email-outline"
          title={language === 'russian' ? 'Уведомления по почте' : 'Email notifications'}
          description={`${profileInfo.emailNotifications ? SETTINGS[language].switchOn : SETTINGS[language].switchOff} ${SETTINGS[language].emailNotifications}`}
          leading={
            <Switch
              value={profileInfo.emailNotifications}
              onValueChange={async () => {
                await updateProfile({
                  body: { emailNotifications: !profileInfo.emailNotifications },
                  id: profileInfo.id,
                });
              }}
            />
          }
        />
      )}
    </>
  );
}
