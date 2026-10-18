import { Platform, ScrollView, useWindowDimensions } from 'react-native';
import { Switch, Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import EmailNotificationsBtn from '@Routes/settings-page/email-notifications/email-notifications-btn/email-notifications-btn';
import SettingsRow from '@Routes/settings-page/settings-row/settings-row';
import { notificationSettingsPageStyles as styles } from '../notification-settings-page.styles';
import { useNotificationSettings } from '../use-notification-settings';

export default function NotificationSettingsPage() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const {
    busy,
    canUpdateProfilePreferences,
    copy,
    inAppNotificationsEnabled,
    isUpdatingInAppPreference,
    permissionChecked,
    pushEnabled,
    toggleInAppNotifications,
    togglePush,
  } = useNotificationSettings();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        {
          width: width < MAX_MOBILE_WIDTH ? '100%' : MAX_MOBILE_WIDTH,
          marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
        },
      ]}>
      <Text variant="bodyMedium" style={[styles.intro, { color: colors.onSurfaceVariant }]}>
        {copy.settingsIntro}
      </Text>
      <SettingsRow
        title={copy.inApp}
        leading={
          <Switch
            testID="in-app-notifications-switch"
            accessibilityLabel={copy.inApp}
            value={inAppNotificationsEnabled}
            disabled={!canUpdateProfilePreferences || isUpdatingInAppPreference}
            onValueChange={(enabled) => void toggleInAppNotifications(enabled)}
          />
        }
      />
      <EmailNotificationsBtn compact />
      <SettingsRow
        title={copy.push}
        leading={
          <Switch
            testID="pushNotificationsSwitch"
            accessibilityLabel={copy.push}
            value={pushEnabled}
            disabled={busy || !canUpdateProfilePreferences || !permissionChecked || Platform.OS !== 'android'}
            onValueChange={() => void togglePush()}
          />
        }
      />
    </ScrollView>
  );
}
