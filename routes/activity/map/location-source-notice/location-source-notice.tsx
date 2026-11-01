import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';

export default function LocationSourceNotice({ message }: { message: string | null }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return message ? (
    <Surface
      testID="location-source-notice"
      accessibilityRole="alert"
      elevation={2}
      style={[styles.notice, { backgroundColor: colors.surface, top: insets.top + 72 }]}>
      <Text variant="bodySmall" style={{ color: colors.onSurface }}>
        {message}
      </Text>
    </Surface>
  ) : null;
}

const styles = StyleSheet.create({
  notice: {
    alignSelf: 'center',
    borderRadius: 12,
    left: 12,
    maxWidth: '90%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    right: 12,
    zIndex: 1,
  },
});
