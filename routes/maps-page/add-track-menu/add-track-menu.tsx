import { useState } from 'react';
import { IconButton, Menu, useTheme } from 'react-native-paper';
import type { AddTrackMenuProps } from './types';

export default function AddTrackMenu({
  accessibilityLabel,
  fromWorkoutsLabel,
  uploadTrackLabel,
  onAddFromWorkouts,
  onUploadTrack,
}: AddTrackMenuProps) {
  const { colors } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Menu
      visible={isVisible}
      onDismiss={() => setIsVisible(false)}
      elevation={3}
      contentStyle={[styles.menuSurface, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
      anchor={
        <IconButton
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          icon="plus"
          onPress={() => setIsVisible(true)}
          testID="routes-add-action"
        />
      }>
      <Menu.Item
        leadingIcon="run"
        title={fromWorkoutsLabel}
        testID="routes-add-from-workouts"
        onPress={() => {
          setIsVisible(false);
          onAddFromWorkouts();
        }}
      />
      <Menu.Item
        leadingIcon="file-import-outline"
        title={uploadTrackLabel}
        testID="routes-upload-track"
        onPress={() => {
          setIsVisible(false);
          onUploadTrack();
        }}
      />
    </Menu>
  );
}

const styles = {
  menuSurface: { borderRadius: 14, borderWidth: 1, paddingVertical: 4 },
};
