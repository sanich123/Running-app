import { Pressable, StyleSheet } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { useSetManualActivityParams } from '../manual-activity-params';
import { SHOW_CAMERA_BTN } from './const';

export default function ShowCameraBtn({ isDisabled }: { isDisabled: boolean }) {
  const { setCameraIsVisible } = useSetManualActivityParams();
  const { language } = useAppSelector(({ settings }) => settings);
  const { isSavingDisabled } = useAppSelector(({ activity }) => activity);
  const { colors } = useTheme();
  const shouldBeDisabled = isDisabled || isSavingDisabled;

  return (
    <Pressable
      onPress={() => setCameraIsVisible(true)}
      style={({ pressed }) => [
        styles.showCameraBtn,
        { borderColor: colors.outlineVariant },
        shouldBeDisabled && styles.disabledButton,
        pressed && !shouldBeDisabled && styles.pressedButton,
      ]}
      accessibilityLabel={SHOW_CAMERA_BTN[language].accessibilityLabel}
      accessibilityRole="button"
      testID="show-camera-button"
      disabled={shouldBeDisabled}>
      <Icon source="camera-outline" size={28} color={colors.onSurface} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  showCameraBtn: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    height: 48,
    justifyContent: 'center',
    marginTop: 12,
    width: '100%',
  },
  disabledButton: { opacity: 0.7 },
  pressedButton: { opacity: 0.7 },
});
