import { StyleSheet } from 'react-native';
import { MAX_MOBILE_WIDTH } from '@const/const';

export const notificationsPageStyles = StyleSheet.create({
  page: { flex: 1 },
  content: { flex: 1, alignSelf: 'center', maxWidth: MAX_MOBILE_WIDTH, paddingHorizontal: 12 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 52 },
  row: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 6,
  },
  copy: { flex: 1, gap: 3 },
  title: { fontWeight: '700' },
  body: { lineHeight: 21 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 7 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  footer: { textAlign: 'center', padding: 16 },
});
