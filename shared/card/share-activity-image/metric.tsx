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
    backgroundColor: 'rgba(74, 78, 88, 0.52)',
    borderColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  metricValue: {
    color: '#FFFFFF',
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 17,
  },
  metricLabel: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 10,
    marginTop: 3,
  },
});
