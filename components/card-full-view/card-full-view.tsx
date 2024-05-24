import Card from '@C/card/card';
import ErrorComponent from '@C/error-component/error-component';
import { runichApi, useGetActivityByActivityIdQuery } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import KmSplit from './km-split/km-split';
import Metrics from './metrics/metrics';

export default function CardFullView() {
  const { id: activityId } = useLocalSearchParams();
  const { isLoading, data: activity, error, isError } = useGetActivityByActivityIdQuery(`${activityId}`);
  const fullViewRef = useRef(null);
  const { isNeedToPrefetchActivities } = useAppSelector(({ profile }) => profile);
  const prefetchLikes = runichApi.usePrefetch('getLikesByActivityId');
  const prefetchComments = runichApi.usePrefetch('getCommentsByActivityId');

  useEffect(() => {
    if (isNeedToPrefetchActivities && !process.env.IS_TESTING) {
      prefetchLikes(`${activityId}`);
      prefetchComments(`${activityId}`);
    }
  }, [activityId]);

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={(isLoading || isError) && styles.isInCenter}>
        <View ref={fullViewRef} collapsable={false}>
          {isLoading && <ActivityIndicator size="large" />}
          {error ? <ErrorComponent error={error} /> : null}
          {activity && (
            <>
              <Card
                isShowDeleteBtn
                isShowDescription={!!activity.description}
                fullViewRef={fullViewRef}
                userId={activity.user_id}
                description={activity.description}
                title={activity.title}
                date={activity.date}
                sport={activity.sport}
                id={activity.id}
                photoVideoUrls={activity.photoVideoUrls}
                duration={activity.duration}
                distance={activity.distance}
                mapPhotoUrl={activity?.mapPhotoUrl}
                profile={activity?.profile}
                likes={activity?.likes}
                commentsLength={activity?.comments?.length}
              />
              <Metrics />
              <View style={{ paddingTop: 10, paddingRight: 10, paddingLeft: 10 }}>
                {activity.kilometresSplit?.length > 0 && <KmSplit kilometresSplit={activity.kilometresSplit} />}
              </View>
            </>
          )}
        </View>
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  isInCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
