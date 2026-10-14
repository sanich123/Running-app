import { StyleSheet } from 'react-native';
import { MAX_MOBILE_WIDTH } from '@const/const';

export const notificationSettingsPageStyles = StyleSheet.create({
  content: { flexGrow: 1, alignSelf: 'center', maxWidth: MAX_MOBILE_WIDTH, padding: 12, gap: 10 },
  intro: { paddingHorizontal: 8, paddingVertical: 6 },
});
