import ErrorComponent from '@C/error-component/error-component';
import { useGetActivityByActivityIdQuery } from '@R/runich-api/runich-api';
import { getSpeedInMinsInKm } from '@U/location-utils';
import { formatDuration } from '@U/time-formatter';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, Divider } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { HOME_ACTIVITY_FULL_VIEW_TEST_ID, HOME_ACTIVITY_FULL_VIEW } from './const';

export default function ActivityFullViewMetrics() {
  const { id: activityId } = useLocalSearchParams();
  const { isLoading, data: activity, error } = useGetActivityByActivityIdQuery(activityId);
  const { language } = useSelector(({ language }) => language);
  const gainedElevation = Math.round(
    activity?.kilometresSplit?.reduce(
      (total: number, { lastKilometerAltitude }: { lastKilometerAltitude: number }) =>
        lastKilometerAltitude > 0 ? (total += lastKilometerAltitude) : total,
      0,
    ),
  );

  return (
    <View style={[styles.layout, isLoading && styles.isCenter]}>
      {isLoading && <ActivityIndicator testID={HOME_ACTIVITY_FULL_VIEW_TEST_ID} />}
      {error ? <ErrorComponent error={error} /> : null}
      {activity && (
        <>
          <Divider />
          <View style={styles.columnLayout}>
            <View style={styles.alignedCenter}>
              <Text variant="bodyLarge">
                {HOME_ACTIVITY_FULL_VIEW[language as keyof typeof HOME_ACTIVITY_FULL_VIEW].distance}
              </Text>
              <Text variant="headlineLarge">
                {(activity.distance / 1000).toFixed(2)}{' '}
                {`${HOME_ACTIVITY_FULL_VIEW[language as keyof typeof HOME_ACTIVITY_FULL_VIEW].km}`}
              </Text>
            </View>

            <View style={styles.alignedCenter}>
              <Text variant="bodyLarge">
                {HOME_ACTIVITY_FULL_VIEW[language as keyof typeof HOME_ACTIVITY_FULL_VIEW].averagePace}
              </Text>
              <Text variant="headlineLarge">
                {getSpeedInMinsInKm(activity.distance, activity.duration).paceAsString}
                {` /${HOME_ACTIVITY_FULL_VIEW[language as keyof typeof HOME_ACTIVITY_FULL_VIEW].km}`}
              </Text>
            </View>
          </View>
          <Divider />
          <View style={styles.columnLayout}>
            <View style={styles.alignedCenter}>
              <Text variant="bodyLarge">
                {HOME_ACTIVITY_FULL_VIEW[language as keyof typeof HOME_ACTIVITY_FULL_VIEW].movingTime}
              </Text>
              <Text variant="headlineLarge">{formatDuration(activity.duration)}</Text>
            </View>
            <View style={styles.alignedCenter}>
              <Text variant="bodyLarge">
                {HOME_ACTIVITY_FULL_VIEW[language as keyof typeof HOME_ACTIVITY_FULL_VIEW].elevationGain}
              </Text>
              <Text variant="headlineLarge">
                {activity?.kilometresSplit?.length > 0 &&
                  `${gainedElevation} ${HOME_ACTIVITY_FULL_VIEW[language as keyof typeof HOME_ACTIVITY_FULL_VIEW].m}`}
              </Text>
            </View>
          </View>
          <View />
          <Divider />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    display: 'flex',
    paddingTop: 40,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 40,
  },
  isCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  columnLayout: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingBottom: 10,
  },
  alignedCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
