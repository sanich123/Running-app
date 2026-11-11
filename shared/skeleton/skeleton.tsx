import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { SkeletonProps } from './types';

export default function Skeleton({ style, testID }: SkeletonProps) {
  const { colors } = useTheme();

  return <View testID={testID} style={[styles.skeleton, { backgroundColor: colors.surfaceVariant }, style]} />;
}

const styles = StyleSheet.create({
  skeleton: {
    borderRadius: 6,
  },
});
