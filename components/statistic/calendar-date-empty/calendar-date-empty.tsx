import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { CalendarDateProps } from '../calendar/types';

export default function CalendarDateEmpty({ isTitle, isEmptyCell }: CalendarDateProps) {
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
      {!isEmptyCell && <View style={{ width: 6, height: 6, backgroundColor: colors.primary, borderRadius: 3 }}></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  dateItem: {
    height: 45,
    width: 45,
    borderWidth: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
});
