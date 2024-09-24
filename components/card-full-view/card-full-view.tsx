import Card from '@C/card/card';
import ErrorComponent from '@C/error-component/error-component';
import { useGetActivityByActivityIdQuery } from '@R/runich-api/runich-api';

import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef } from 'react';
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import KmSplit from './km-split/km-split';
import Metrics from './metrics/metrics';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export default function CardFullView() {
  const { id: activityId } = useLocalSearchParams();
  const {
    isLoading,
    data: activity,
    isSuccess,
    error,
    isError,
    refetch,
  } = useGetActivityByActivityIdQuery(`${activityId}`);
  const fullViewRef = useRef(null);
  const { height } = useWindowDimensions();
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={((isLoading || isError) && styles.isInCenter, isSuccess && { height })}>
      <BottomSheetModalProvider>
        <>
          <View ref={fullViewRef} collapsable={false}>
            {isLoading && <ActivityIndicator size="large" />}
            {error ? <ErrorComponent error={error} refetch={refetch} /> : null}
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
                  commentsLength={activity?._count.comments}
                />
                <Metrics />
                <View style={{ paddingTop: 10, paddingRight: 10, paddingLeft: 10 }}>
                  {activity.kilometresSplit?.length > 0 && <KmSplit kilometresSplit={activity.kilometresSplit} />}
                </View>
              </>
            )}
          </View>
          <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        </>
      </BottomSheetModalProvider>
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
