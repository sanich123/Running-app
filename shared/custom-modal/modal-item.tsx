import { useCallback } from 'react';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import type { ModalItemProps } from './types';

export default function ModalItem({ setSelectedValue, controlRef, onChange, value, title }: ModalItemProps) {
  const {
    colors: { background },
  } = useTheme();

  const handleClosePress = useCallback(() => {
    controlRef.current?.close();
  }, [controlRef]);
  return (
    <TouchableOpacity
      activeOpacity={0.2}
      key={value}
      onPress={() => {
        setSelectedValue(title, value);
        onChange(value);
        handleClosePress();
      }}
      style={[styles.listItem, { backgroundColor: background }]}>
      <Text variant="bodyLarge">{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  listItem: {
    display: 'flex',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
});
