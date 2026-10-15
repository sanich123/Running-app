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
    position: 'relative',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 6,
  },
  rowContent: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  copy: { flex: 1, gap: 3 },
  title: { fontWeight: '700' },
  body: { lineHeight: 21 },
  avatarImage: { width: 48, height: 48, borderRadius: 24 },
  unreadDot: {
    position: 'absolute',
    zIndex: 1,
    top: 10,
    right: 18,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  readButton: { margin: 0, alignSelf: 'flex-end' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  footer: { textAlign: 'center', padding: 16 },
});
