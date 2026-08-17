import { StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { useSetManualActivityParams } from '../manual-activity-params';
import { SHOW_CAMERA_BTN } from './const';

export default function ShowCameraBtn({ isDisabled }: { isDisabled: boolean }) {
  const { setCameraIsVisible } = useSetManualActivityParams();
  const { language } = useAppSelector(({ settings }) => settings);
  const { isDisabledWhileSending } = useAppSelector(({ activity }) => activity);
  const { colors } = useTheme();
  const shouldBeDisabled = isDisabled || isDisabledWhileSending;

  return (
    <Button
      mode="outlined"
      icon="camera-outline"
      compact
      style={[styles.showCameraBtn, { borderColor: colors.outlineVariant }, shouldBeDisabled && styles.disabledButton]}
      contentStyle={styles.content}
      textColor={colors.onSurface}
      onPress={() => setCameraIsVisible(true)}
      disabled={shouldBeDisabled}>
      {SHOW_CAMERA_BTN[language].text}
    </Button>
  );
}

const styles = StyleSheet.create({
  showCameraBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderRadius: 8,
    marginTop: 12,
  },
  content: { minHeight: 42 },
  disabledButton: { opacity: 0.7 },
});
