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
          borderWidth: isEmptyCell || !isTitle ? 0 : 1,
          borderColor: colors.onBackground,
        },
      ]}>
      {!isEmptyCell && (
        <Text
          variant={isTitle ? 'labelSmall' : 'bodySmall'}
          style={{ color: isTitle ? colors.onSurfaceVariant : colors.onSurface }}>
          {dateValue}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dateItem: {
    height: 40,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
});
