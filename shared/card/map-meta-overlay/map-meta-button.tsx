import type { ReactNode } from 'react';
import { StyleSheet, type GestureResponderEvent } from 'react-native';
import { IconButton } from 'react-native-paper';

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
    <IconButton
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      icon={() => children}
      size={24}
      iconColor="#FFFFFF"
      disabled={disabled}
      onPress={onPress}
      rippleColor="rgba(255, 255, 255, 0.24)"
      style={styles.button}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    height: 40,
    margin: 0,
    width: 40,
  },
});
