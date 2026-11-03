import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IconButton } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { GROUPS_COPY } from '../../const';
import GroupNotificationSettings from '../../group-notification-settings/group-notification-settings';

export default function GroupsPageHeaderActions() {
  const router = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const { create, groupNotificationSettings } = GROUPS_COPY[language];
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);

  return (
    <>
      <View style={styles.headerActions}>
        <IconButton
          icon="account-multiple-plus-outline"
          accessibilityLabel={create}
          onPress={() => router.push('/groups/create' as never)}
          style={styles.headerActionButton}
          testID="groups-create-button"
        />
        <IconButton
          icon="cog-outline"
          accessibilityLabel={groupNotificationSettings}
          onPress={() => setIsNotificationSettingsOpen(true)}
          style={styles.headerActionButton}
          testID="groups-settings-button"
        />
      </View>
      {isNotificationSettingsOpen ? (
        <GroupNotificationSettings visible onDismiss={() => setIsNotificationSettingsOpen(false)} />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  headerActions: { alignItems: 'center', flexDirection: 'row' },
  headerActionButton: { marginRight: 0 },
});
