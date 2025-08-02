import Card from '@C/card/card';
import ErrorComponent from '@C/error-component/error-component';
import { useGetActivityByActivityIdQuery } from '@R/services/activity/activity';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, useWindowDimensions, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import KmSplit from './km-split/km-split';
import Metrics from './metrics/metrics';
import { MAX_MOBILE_WIDTH } from '@const/const';
import CrossPlatformLayout from '@C/shared/cross-platform-layout/cross-platform-layout';

export default function CardFullView() {
  const { width } = useWindowDimensions();
  const { id: activityId } = useLocalSearchParams();
  const {
    isLoading,
    data: activity,
    isSuccess,
    error,
    isError,
    refetch,
  } = useGetActivityByActivityIdQuery(`${activityId}`, { skip: !activityId });

  return (
    <CrossPlatformLayout edges={[]} scrollViewEnabled isError={isError} isLoading={isLoading}>
      <View collapsable={false}>
        {isLoading && <ActivityIndicator size="large" />}
        {isError ? <ErrorComponent error={error} refetch={refetch} /> : null}
        {isSuccess && (
          <>
            <Card
              isShowDeleteBtn
              isShowDescription={!!activity?.description}
              userId={activity?.user_id}
              description={activity?.description}
              title={activity?.title}
              date={activity?.date}
              sport={activity?.sport}
              id={activity?.id}
              photoVideoUrls={activity?.photoVideoUrls}
              duration={activity?.duration}
              distance={activity?.distance}
              mapPhotoUrl={activity?.mapPhotoUrl}
              profile={activity?.profile}
              commentsLength={activity?._count.comments}
            />
            <Metrics />
            <View
              style={{
                paddingVertical: 10,
                paddingHorizontal: 10,
                width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
                marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
              }}>
              {activity?.kilometresSplit?.length > 0 && <KmSplit kilometresSplit={activity.kilometresSplit} />}
            </View>
          </>
        )}
      </View>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </CrossPlatformLayout>
  );
}
