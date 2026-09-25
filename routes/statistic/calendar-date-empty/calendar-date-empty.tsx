import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { CalendarDateProps } from '../calendar/types';

export default function CalendarDateEmpty({ isTitle, isEmptyCell, dateValue }: CalendarDateProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.dateItem,
        {
          backgroundColor: isEmptyCell ? 'transparent' : colors.surfaceVariant,
          borderColor: colors.outlineVariant,
        },
      ]}>
      {!isEmptyCell && (
        <Text
          variant={isTitle ? 'labelSmall' : 'bodySmall'}
          style={[styles.dateValue, { color: isTitle ? colors.onSurfaceVariant : colors.onSurface }]}>
          {dateValue}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dateItem: {
    height: 54,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  dateValue: { fontWeight: '600' },
});
