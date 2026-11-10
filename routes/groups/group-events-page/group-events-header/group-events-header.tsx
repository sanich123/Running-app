import { StyleSheet, View } from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';
import type { GroupEventsHeaderProps } from './types';

export default function GroupEventsHeader({
  groupName,
  period,
  onPeriodChange,
  copy,
  showTitle = true,
}: GroupEventsHeaderProps) {
  const { events, upcomingEvents, pastEvents } = copy;
  return (
    <View style={styles.container}>
      {showTitle ? (
        <Text variant="headlineSmall" style={styles.heading}>
          {events} · {groupName}
        </Text>
      ) : null}
      <SegmentedButtons
        value={period}
        onValueChange={(value) => {
          if (value !== 'upcoming' && value !== 'past') return;
          onPeriodChange(value);
        }}
        buttons={[
          { value: 'upcoming', label: upcomingEvents },
          { value: 'past', label: pastEvents },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({ container: { gap: 12 }, heading: { fontWeight: '700' } });
