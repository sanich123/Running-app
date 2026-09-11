import { Platform, useWindowDimensions, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetActivityByActivityIdQuery } from '@R/services/activity/activity';
import Card from '@S/card/card';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import ErrorComponent from '@S/error-component/error-component';
import KmSplit from './km-split/km-split';
import Metrics from './metrics/metrics';

export default function CardFullView() {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
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
      scrollViewEnabled={!isLoading && !isError}
      outerStyles={styles.page}>
      <View collapsable={false} style={[styles.content, (isLoading || isError) && styles.state]}>
        {isLoading ? (
          <ActivityIndicator size="large" testID="homeActivityIndicator" />
        ) : isSuccess && activity ? (
          <>
            <Card
              isFullView
              isShowDeleteBtn
              isShowDescription={!!activity.description}
              userId={activity.userId}
              description={activity.description}
              title={activity.title}
              date={activity.date}
              sport={activity.sport}
              id={activity.id}
              photoVideoUrls={activity.photoVideoUrls}
              duration={activity.duration}
              distance={activity.distance}
              steps={activity.steps}
              kilometresSplit={activity.kilometresSplit}
              mapPhotoUrl={activity.mapPhotoUrl}
              profile={activity.profile}
              commentsLength={activity._count.comments}
              likesLength={activity._count.likes}
            />
            <Metrics />
            {Boolean(activity.kilometresSplit?.length) && (
              <View
                style={[
                  styles.splitsCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.outlineVariant,
                    width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
                    marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
                  },
                ]}>
                <KmSplit kilometresSplit={activity.kilometresSplit ?? []} />
              </View>
            )}
          </>
        ) : isError ? (
          <ErrorComponent error={error} refetch={refetch} />
        ) : null}
      </View>
    </CrossPlatformLayout>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 12, paddingVertical: 12 },
  content: { flex: 1, gap: 12 },
  state: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  splitsCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
  },
});
