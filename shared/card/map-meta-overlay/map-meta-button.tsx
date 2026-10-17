import type { ReactNode } from 'react';
import { StyleSheet, View, type GestureResponderEvent } from 'react-native';
import { TouchableRipple } from 'react-native-paper';

interface MapMetaButtonProps {
  accessibilityLabel: string;
  children: ReactNode;
  disabled?: boolean;
  onPress: (event: GestureResponderEvent) => void;
  testID: string;
}

export default function MapMetaButton({
  accessibilityLabel,
  children,
  disabled = false,
  onPress,
  testID,
}: MapMetaButtonProps) {
  return (
    <TouchableRipple
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={[styles.container, disabled && styles.disabled]}>
      <View pointerEvents="none" style={styles.content}>
        {children}
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 48,
  },
  content: { alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.5 },
});
