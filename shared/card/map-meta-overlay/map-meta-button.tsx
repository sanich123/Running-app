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
    backgroundColor: 'rgba(15, 17, 22, 0.5)',
    borderRadius: 21,
    height: 42,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 42,
  },
  content: { alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.5 },
});
