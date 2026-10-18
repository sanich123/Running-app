import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';

export default function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text numberOfLines={1} style={styles.metricValue}>
        {value}
      </Text>
      <Text numberOfLines={1} style={styles.metricLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metric: {
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    flexBasis: '50%',
    flexGrow: 1,
    minWidth: 0,
    minHeight: 70,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  metricValue: {
    color: '#FFFFFF',
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 18,
  },
  metricLabel: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 11,
    marginTop: 3,
  },
});
