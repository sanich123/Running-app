import { Switch } from 'react-native-paper';
import { useEmailNotifications } from './use-email-notifications';
import SettingsRow from '../settings-row/settings-row';
import type { EmailNotificationsBtnProps } from './types';

export default function EmailNotificationsBtn({ compact = false }: EmailNotificationsBtnProps) {
  const { description, isEnabled, isVisible, title, toggleEmailNotifications } = useEmailNotifications(compact);

  return (
    <>
      {isVisible && (
        <SettingsRow
          title={title}
          description={description}
          leading={
            <Switch
              testID="email-notifications-switch"
              value={isEnabled}
              onValueChange={() => void toggleEmailNotifications()}
            />
          }
        />
      )}
    </>
  );
}
