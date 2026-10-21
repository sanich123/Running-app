import { Suspense } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetActivityByActivityIdQuery } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import Card from '@S/card/activity-card/activity-card';
import ConfirmDialog from '@S/confirm-dialog/confirm-dialog';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import ErrorComponent from '@S/error-component/error-component';
import ActivityActionsMenu from './activity-actions-menu/activity-actions-menu';
import { ACTIVITY_ACTIONS_MENU } from './activity-actions-menu/const';
import useDeleteActivityAction from './activity-actions-menu/delete-activity-button/use-delete-activity-action';
import useEditActivityAction from './activity-actions-menu/edit-activity-button/use-edit-activity-action';
import { LazyUsersSettingsIcons } from './const';
import KilometreSplitTable from './kilometre-split-table/kilometre-split-table';
import Metrics from './metrics/metrics';

export default function ActivityDetails() {
  const { colors } = useTheme();
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
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
  const isActivityOwner = Boolean(activity?.userId && activity.userId === currentUserId);
  const shouldShowToolbarMenu = Platform.OS === 'ios' && isActivityOwner;
  const editActivityAction = useEditActivityAction(activity);
  const deleteActivityAction = useDeleteActivityAction(activity);
  const menuText = ACTIVITY_ACTIONS_MENU[language];

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => {
            if (isActivityOwner && activity) {
              return Platform.OS === 'ios' ? null : <ActivityActionsMenu activity={activity} />;
            }

            return (
              <Suspense fallback={null}>
                <LazyUsersSettingsIcons />
              </Suspense>
            );
          },
        }}>
        {shouldShowToolbarMenu ? (
          <Stack.Toolbar placement="right">
            <Stack.Toolbar.Menu icon="ellipsis" accessibilityLabel={menuText.accessibilityLabel}>
              <Stack.Toolbar.MenuAction icon="pencil" onPress={editActivityAction}>
                {menuText.edit}
              </Stack.Toolbar.MenuAction>
              <Stack.Toolbar.MenuAction icon="trash" destructive onPress={deleteActivityAction.onPress}>
                {menuText.delete}
              </Stack.Toolbar.MenuAction>
            </Stack.Toolbar.Menu>
          </Stack.Toolbar>
        ) : null}
      </Stack.Screen>
      {shouldShowToolbarMenu ? (
        <ConfirmDialog
          visible={deleteActivityAction.isConfirmDialogVisible}
          title={deleteActivityAction.confirmation.deleteActivity}
          message={deleteActivityAction.confirmation.question}
          confirmText={deleteActivityAction.confirmation.accept}
          cancelText={deleteActivityAction.confirmation.cancel}
          destructive
          loading={deleteActivityAction.isDeleteRequestLoading}
          onDismiss={deleteActivityAction.onDismiss}
          onConfirm={deleteActivityAction.onConfirm}
        />
      ) : null}
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
              {Boolean(activity.kilometresSplit?.length) && (
                <View
                  testID="activity-kilometre-splits-card"
                  style={[
                    styles.splitsCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.outlineVariant,
                      width: '100%',
                      maxWidth: MAX_MOBILE_WIDTH,
                      marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
                    },
                  ]}>
                  <KilometreSplitTable kilometresSplit={activity.kilometresSplit ?? []} />
                </View>
              )}
              <Metrics />
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
  page: { paddingBottom: 12 },
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
