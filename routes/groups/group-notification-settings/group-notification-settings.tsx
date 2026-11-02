import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Dialog, Portal, Switch, Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import SettingsRow from '@Routes/settings-page/settings-row/settings-row';
import { GROUPS_COPY } from '../const';
import { useGroupNotificationPreferences } from './use-group-notification-preferences';

export default function GroupNotificationSettings({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const groupCopy = GROUPS_COPY[language];
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

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{groupCopy.groupNotificationSettingsTitle}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={[styles.hint, { color: colors.onSurfaceVariant }]}>
            {groupCopy.groupNotificationDeliveryHint}
          </Text>
          <View style={styles.settings}>
            {isLoading ? (
              <ActivityIndicator testID="group-notification-settings-loading" />
            ) : (
              <>
                <SettingsRow
                  title={copy.groupPostsNotifications}
                  leading={
                    <Switch
                      testID="group-post-notifications-switch"
                      accessibilityLabel={copy.groupPostsNotifications}
                      value={groupPostsEnabled}
                      disabled={!canUpdate || isUpdating}
                      onValueChange={(enabled) => void toggleGroupPosts(enabled)}
                    />
                  }
                />
                <SettingsRow
                  title={copy.groupEventsNotifications}
                  leading={
                    <Switch
                      testID="group-event-notifications-switch"
                      accessibilityLabel={copy.groupEventsNotifications}
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
