import { StyleSheet } from 'react-native';

export const usersSettingsIconsStyles = StyleSheet.create({
  layout: { display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' },
  iconButton: { margin: 0 },
  notificationButton: { position: 'relative' },
  badge: { position: 'absolute', right: -1, top: -1 },
});
