import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import ActivityCard from '../../../../components/card/card';
import ErrorComponent from '../../../../components/error-component/error-component';
import { useGetActivityByActivityIdQuery } from '../../../../redux/runich-api/runich-api';
import { getSpeedInMinsInKm } from '../../../../utils/location-utils';
import { formatDuration } from '../../../../utils/time-formatter';

export default function ViewActivityFullInfo() {
  const { id: activityId } = useLocalSearchParams();
  const { isLoading, data: activity, error } = useGetActivityByActivityIdQuery(activityId);
  console.log(activity?.kilometresSplit);
  return (
    <ScrollView style={[{ flex: 1 }, isLoading && { alignItems: 'center', justifyContent: 'center' }]}>
      {isLoading && <ActivityIndicator />}
      {error ? <ErrorComponent error={error} /> : null}
      {activity && (
        <>
          <ActivityCard
            userId={activity.user_id}
            description={activity.description}
            title={activity.title}
            date={activity.date}
            sport={activity.sport}
            id={activity.id}
            locations={activity.locations}
            photoUrls={activity.photoUrls}
            duration={activity.duration}
            speed={activity.speed}
            distance={activity.distance}
          />
          <View style={{ display: 'flex', paddingTop: 20, paddingLeft: 20, paddingRight: 20, paddingBottom: 20 }}>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Text variant="bodyLarge">Distance</Text>
                <Text variant="headlineLarge">{activity.distance / 1000} km</Text>
              </View>
              <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Text variant="bodyLarge">Avg Pace</Text>
                <Text variant="headlineLarge">{getSpeedInMinsInKm(activity.distance, activity.duration)} /km</Text>
              </View>
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Text variant="bodyLarge">Moving Time</Text>
                <Text variant="headlineLarge">{formatDuration(activity.duration)}</Text>
              </View>
              <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Text variant="bodyLarge">Elevation Gain</Text>
                <Text variant="headlineLarge">200 m</Text>
              </View>
            </View>

            <View />
          </View>
          <View style={{ paddingTop: 10, paddingRight: 10, paddingLeft: 10 }}>
            {activity?.kilometresSplit?.length
              ? activity.kilometresSplit.map(({ lastKilometerAltitude, lastKilometerDuration }, index) => (
                  <View
                    style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}
                    key={`${index}/${lastKilometerAltitude * lastKilometerDuration}`}>
                    <Text variant="bodyLarge">{index + 1} km</Text>
                    <Text variant="bodyLarge">{formatDuration(lastKilometerDuration)}</Text>
                    <Text variant="bodyLarge">{lastKilometerAltitude.toFixed(1)}</Text>
                  </View>
                ))
              : null}
          </View>
        </>
      )}
    </ScrollView>
  );
}
