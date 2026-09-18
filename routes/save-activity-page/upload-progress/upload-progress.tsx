import Svg, { Circle } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';

interface UploadProgressProps {
  progress: number;
  size: number;
  testID: string;
  iconColor?: string;
}

export default function UploadProgress({ progress, size, testID, iconColor }: UploadProgressProps) {
  const { colors } = useTheme();
  const clampedProgress = Math.max(0, Math.min(progress, 1));
  const strokeWidth = Math.max(2, size * 0.08);
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View
      testID={testID}
      style={[styles.container, { height: size, width: size }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 1, now: clampedProgress }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={StyleSheet.absoluteFill}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={colors.outlineVariant}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={colors.primary}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - clampedProgress)}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <Icon source="close" size={Math.max(14, size * 0.42)} color={iconColor ?? colors.onSurface} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
