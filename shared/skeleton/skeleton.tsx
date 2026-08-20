import { View, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function Skeleton({ style, testID }: { style?: StyleProp<ViewStyle>; testID?: string }) {
  const { colors } = useTheme();

  return <View testID={testID} style={[styles.skeleton, { backgroundColor: colors.surfaceVariant }, style]} />;
}

const styles = StyleSheet.create({
  skeleton: {
    borderRadius: 6,
  },
});
