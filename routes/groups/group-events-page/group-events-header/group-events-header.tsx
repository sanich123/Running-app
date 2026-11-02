import { StyleSheet, View } from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';
import type { GroupEventPeriod, GroupEventsCopy } from '../types';

export default function GroupEventsHeader({
  groupName,
  period,
  onPeriodChange,
  copy,
  showTitle = true,
}: {
  groupName: string;
  period: GroupEventPeriod;
  onPeriodChange: (period: GroupEventPeriod) => void;
  copy: GroupEventsCopy;
  showTitle?: boolean;
}) {
  return (
    <View style={styles.container}>
      {showTitle && (
        <Text variant="headlineSmall" style={styles.heading}>
          {copy.events} · {groupName}
        </Text>
      )}
      <SegmentedButtons
        value={period}
        onValueChange={(value) => onPeriodChange(value as GroupEventPeriod)}
        buttons={[
          { value: 'upcoming', label: copy.upcomingEvents },
          { value: 'past', label: copy.pastEvents },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({ container: { gap: 12 }, heading: { fontWeight: '700' } });
