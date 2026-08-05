import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import Card from '@C/card/card';
import ErrorComponent from '@C/error-component/error-component';
import CrossPlatformLayout from '@C/shared/cross-platform-layout/cross-platform-layout';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetActivityByActivityIdQuery } from '@R/services/activity/activity';
import KmSplit from './km-split/km-split';
import Metrics from './metrics/metrics';

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
    <CrossPlatformLayout
      edges={[]}
      isError={isError}
      isLoading={isLoading}
      scrollViewEnabled={!isLoading && !isError}>
      <View
        collapsable={false}
        style={[styles.content, (isLoading || isError) && styles.state]}> 
        {isLoading ? <ActivityIndicator size="large" testID="homeActivityIndicator" /> : null}
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
    </CrossPlatformLayout>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  state: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
