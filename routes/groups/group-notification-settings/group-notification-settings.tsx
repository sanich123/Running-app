import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Dialog, Portal, Switch, Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import SettingsRow from '@Routes/settings-page/settings-row/settings-row';
import { RESPONSIVE_DIALOG_STYLE } from '@S/responsive-dialog-style';
import { GROUPS_COPY } from '../const';
import { useGroupNotificationPreferences } from './use-group-notification-preferences';
import type { GroupNotificationSettingsProps } from './types';

export default function GroupNotificationSettings({ visible, onDismiss }: GroupNotificationSettingsProps) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const groupCopy = GROUPS_COPY[language];
  const { groupNotificationDeliveryHint, groupNotificationSettingsTitle } = groupCopy;
  const {
    canUpdate,
    copy,
    groupEventsEnabled,
    groupPostsEnabled,
    isLoading,
    isUpdating,
    toggleGroupEvents,
    toggleGroupPosts,
  } = useGroupNotificationPreferences();
  const { groupEventsNotifications, groupPostsNotifications } = copy;

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={RESPONSIVE_DIALOG_STYLE}>
        <Dialog.Title>{groupNotificationSettingsTitle}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={[styles.hint, { color: colors.onSurfaceVariant }]}>
            {groupNotificationDeliveryHint}
          </Text>
          <View style={styles.settings}>
            {isLoading ? (
              <ActivityIndicator testID="group-notification-settings-loading" />
            ) : (
              <>
                <SettingsRow
                  title={groupPostsNotifications}
                  leading={
                    <Switch
                      testID="group-post-notifications-switch"
                      accessibilityLabel={groupPostsNotifications}
                      value={groupPostsEnabled}
                      disabled={!canUpdate || isUpdating}
                      onValueChange={(enabled) => void toggleGroupPosts(enabled)}
                    />
                  }
                />
                <SettingsRow
                  title={groupEventsNotifications}
                  leading={
                    <Switch
                      testID="group-event-notifications-switch"
                      accessibilityLabel={groupEventsNotifications}
                      value={groupEventsEnabled}
                      disabled={!canUpdate || isUpdating}
                      onValueChange={(enabled) => void toggleGroupEvents(enabled)}
                    />
                  }
                />
              </>
            )}
          </View>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  hint: { lineHeight: 20 },
  settings: { gap: 8, marginTop: 16 },
});
