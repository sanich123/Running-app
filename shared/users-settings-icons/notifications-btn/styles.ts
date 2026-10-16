import { StyleSheet } from 'react-native';

export const notificationsBtnStyles = StyleSheet.create({
  button: { position: 'relative' },
  contents: {
    position: 'relative',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: { position: 'absolute', right: 6, top: 3 },
});
