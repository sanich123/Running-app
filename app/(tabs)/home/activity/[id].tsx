import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import ActivityCard from '../../../../components/card/card';
import ErrorComponent from '../../../../components/error-component/error-component';
import ActivityFullViewMetrics from '../../../../components/home-activity-full-view/home-activity-full-view';
import HomeActivityFullViewKmSplit from '../../../../components/home-activity-full-view-km-split/home-activity-full-view-km-split';
import { useGetActivityByActivityIdQuery } from '../../../../redux/runich-api/runich-api';

export default function ViewActivityFullInfo() {
  const { id: activityId } = useLocalSearchParams();
  const { isLoading, data: activity, error } = useGetActivityByActivityIdQuery(activityId);

  return (
    <ScrollView contentContainerStyle={isLoading && { flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View>
        {isLoading && <ActivityIndicator size="large" />}
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
              distance={activity.distance}
            />
            <ActivityFullViewMetrics />
            <View style={{ paddingTop: 10, paddingRight: 10, paddingLeft: 10 }}>
              {activity.kilometresSplit?.length > 0 && (
                <HomeActivityFullViewKmSplit kilometresSplit={activity.kilometresSplit} />
              )}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
