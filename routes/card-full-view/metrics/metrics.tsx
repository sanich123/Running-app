import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text, Divider, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetActivityByActivityIdQuery } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import ErrorComponent from '@S/error-component/error-component';
import { getSpeedInMinsInKm } from '@U/location/location-utils';
import { formatDuration } from '@U/time-formatter';
import { HOME_ACTIVITY_FULL_VIEW_TEST_ID, HOME_ACTIVITY_FULL_VIEW } from './const';

export default function Metrics() {
  const { width } = useWindowDimensions();
  const { id: activityId } = useLocalSearchParams();
  const { isLoading, data: activity, error } = useGetActivityByActivityIdQuery(`${activityId}`);
  const { language } = useAppSelector(({ language }) => language);
  const { colors } = useTheme();
  const gainedElevation = Math.round(
    activity?.kilometresSplit?.reduce(
      (total: number, { lastKilometerAltitude }: { lastKilometerAltitude: number }) =>
        lastKilometerAltitude > 0 ? (total += lastKilometerAltitude) : total,
      0,
    ) ?? 0,
  );

  return (
    <View
      style={[
        styles.layout,
        { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
        isLoading && styles.isCenter,
        {
          width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
          marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
        },
      ]}>
      {isLoading && <ActivityIndicator testID={HOME_ACTIVITY_FULL_VIEW_TEST_ID} />}
      {error ? <ErrorComponent error={error} /> : null}
      {activity && (
        <>
          <View style={styles.columnLayout}>
            <View style={styles.alignedCenter}>
              <Text variant="bodyLarge">{HOME_ACTIVITY_FULL_VIEW[language].distance}</Text>
              <Text variant="titleLarge">
                {(activity.distance / 1000).toFixed(2)} {`${HOME_ACTIVITY_FULL_VIEW[language].km}`}
              </Text>
            </View>

            <View style={styles.alignedCenter}>
              <Text variant="bodyLarge">{HOME_ACTIVITY_FULL_VIEW[language].averagePace}</Text>
              <Text variant="titleLarge">
                {getSpeedInMinsInKm(activity.distance, activity.duration).paceAsString}
                {` /${HOME_ACTIVITY_FULL_VIEW[language].km}`}
              </Text>
            </View>
          </View>
          <Divider />
          <View style={styles.columnLayout}>
            <View style={styles.alignedCenter}>
              <Text variant="bodyLarge">{HOME_ACTIVITY_FULL_VIEW[language].movingTime}</Text>
              <Text variant="titleLarge">{formatDuration(activity.duration)}</Text>
            </View>
            <View style={styles.alignedCenter}>
              <Text variant="bodyLarge">{HOME_ACTIVITY_FULL_VIEW[language].elevationGain}</Text>
              <Text variant="titleLarge">
                {Boolean(activity.kilometresSplit?.length) &&
                  `${gainedElevation} ${HOME_ACTIVITY_FULL_VIEW[language].m}`}
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    borderRadius: 18,
    borderWidth: 1,
    display: 'flex',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
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
