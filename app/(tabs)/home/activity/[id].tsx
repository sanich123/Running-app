import ActivityFullViewMetrics from '@C/activity-full-view/activity-full-view';
import ActivityFullViewKmSplit from '@C/activity-full-view-km-split/activity-full-view-km-split';
import ActivityCard from '@C/card/card';
import ErrorComponent from '@C/error-component/error-component';
import { useGetActivityByActivityIdQuery } from '@R/runich-api/runich-api';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

export default function ViewActivityFullInfo() {
  const { id: activityId } = useLocalSearchParams();
  const { isLoading, data: activity, error, isError } = useGetActivityByActivityIdQuery(`${activityId}`);
  const fullViewRef = useRef(null);
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={(isLoading || isError) && styles.isInCenter}>
      <View ref={fullViewRef} collapsable={false}>
        {isLoading && <ActivityIndicator size="large" />}
        {error ? <ErrorComponent error={error} /> : null}
        {activity && (
          <>
            <ActivityCard
              isShowDeleteBtn
              isShowDescription
              fullViewRef={fullViewRef}
              userId={activity.user_id}
              description={activity.description}
              title={activity.title}
              date={activity.date}
              sport={activity.sport}
              id={activity.id}
              photoUrls={activity.photoUrls}
              duration={activity.duration}
              distance={activity.distance}
              likes={activity.likes}
              comments={activity.comments}
            />
            <ActivityFullViewMetrics />
            <View style={{ paddingTop: 10, paddingRight: 10, paddingLeft: 10 }}>
              {activity.kilometresSplit?.length > 0 && (
                <ActivityFullViewKmSplit kilometresSplit={activity.kilometresSplit} />
              )}
            </View>
          </>
        )}
      </View>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
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
