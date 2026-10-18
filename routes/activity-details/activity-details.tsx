import { Suspense } from 'react';
import { Platform, useWindowDimensions, View, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetActivityByActivityIdQuery } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import Card from '@S/card/activity-card/activity-card';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import ErrorComponent from '@S/error-component/error-component';
import ActivityActionsMenu from './activity-actions-menu/activity-actions-menu';
import { LazyUsersSettingsIcons } from './const';
import KilometreSplitTable from './kilometre-split-table/kilometre-split-table';
import Metrics from './metrics/metrics';

export default function ActivityDetails() {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
  const { id: activityId } = useLocalSearchParams();
  const {
    isLoading,
    data: activity,
    isSuccess,
    error,
    isError,
    refetch,
  } = useGetActivityByActivityIdQuery(
    { activityId: `${activityId}`, viewerId: currentUserId ?? '' },
    { skip: !activityId || !currentUserId },
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () =>
            activity?.userId && activity.userId === currentUserId ? (
              <ActivityActionsMenu activity={activity} />
            ) : (
              <Suspense fallback={null}>
                <LazyUsersSettingsIcons />
              </Suspense>
            ),
        }}
      />
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
                isShowDescription={!!activity.description}
                activity={{
                  ...activity,
                  commentsLength: activity._count.comments,
                  likesLength: activity._count.likes,
                }}
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
                  <KilometreSplitTable kilometresSplit={activity.kilometresSplit ?? []} />
                </View>
              )}
            </>
          ) : isError ? (
            <ErrorComponent error={error} refetch={refetch} />
          ) : null}
        </View>
      </CrossPlatformLayout>
    </>
  );
}

const styles = StyleSheet.create({
  page: { paddingVertical: 12 },
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
