import ActivityCard from '@C/card/card';
import ErrorComponent from '@C/error-component/error-component';
import ActivityFullViewMetrics from '@C/activity-full-view/home-activity-full-view';
import HomeActivityFullViewKmSplit from '@C/activity-full-view-km-split/home-activity-full-view-km-split';
import { useGetActivityByActivityIdQuery } from '@R/runich-api/runich-api';
import { useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

export default function ViewActivityFullInfo() {
  const { id: activityId } = useLocalSearchParams();
  const { isLoading, data: activity, error, isError } = useGetActivityByActivityIdQuery(activityId);
  const fullViewRef = useRef();

  return (
    <ScrollView contentContainerStyle={(isLoading || isError) && styles.isInCenter}>
      <View ref={fullViewRef} collapsable={false}>
        {isLoading && <ActivityIndicator size="large" />}
        {error ? <ErrorComponent error={error} /> : null}
        {activity && (
          <>
            <ActivityCard
              fullViewRef={fullViewRef}
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

const styles = StyleSheet.create({
  isInCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
