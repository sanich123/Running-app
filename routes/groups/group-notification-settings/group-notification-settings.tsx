import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Switch, Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { GROUPS_COPY } from '../const';
import { useGroupNotificationPreferences } from './use-group-notification-preferences';

export default function GroupNotificationSettings() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { groupNotificationSettingsTitle } = GROUPS_COPY[language];
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
    <View style={styles.group} testID="group-notification-settings">
      <Text variant="titleSmall" style={[styles.groupTitle, { color: colors.primary }]}>
        {groupNotificationSettingsTitle}
      </Text>
      {isLoading ? (
        <ActivityIndicator testID="group-notification-settings-loading" />
      ) : (
        <>
          <View style={styles.setting}>
            <Text variant="bodyMedium" style={styles.copy}>
              {groupPostsNotifications}
            </Text>
            <Switch
              testID="group-post-notifications-switch"
              accessibilityLabel={groupPostsNotifications}
              value={groupPostsEnabled}
              disabled={!canUpdate || isUpdating}
              onValueChange={(enabled) => void toggleGroupPosts(enabled)}
            />
          </View>
          <View style={styles.setting}>
            <Text variant="bodyMedium" style={styles.copy}>
              {groupEventsNotifications}
            </Text>
            <Switch
              testID="group-event-notifications-switch"
              accessibilityLabel={groupEventsNotifications}
              value={groupEventsEnabled}
              disabled={!canUpdate || isUpdating}
              onValueChange={(enabled) => void toggleGroupEvents(enabled)}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 14 },
  groupTitle: { fontWeight: '600' },
  setting: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  copy: { flex: 1, minWidth: 0 },
});
