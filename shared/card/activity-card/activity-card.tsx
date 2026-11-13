import { useCallback } from 'react';
import { Platform, useWindowDimensions, View, StyleSheet } from 'react-native';
import { Button, Card, Icon, Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { Tags } from '@R/runich-api/const';
import { activityApi } from '@R/services/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import CommentBtn from '@S/card/comment-btn/comment-btn';
import LikeBtn from '@S/card/like-btn/like-btn';
import ShareBtn from '@S/card/share-btn/share-btn';
import UserInfo from '@S/card/user-info/user-info';
import useAutoModerationRefresh from '@S/moderation/use-auto-moderation-refresh';
import { ActivityCardContext } from '../context';
import Likes from '../likes/likes';
import MediaList from '../media-list/media-list';
import Metrics from '../metrics/metrics';
import { UserInfoSize } from '../user-info/const';
import { ACTIVITY_TEXT_MODERATION_COPY } from './const';
import type { ActivityCardProps } from '../types';

export default function ActivityCard({ activity, isFullView = false, isShowDescription }: ActivityCardProps) {
  const { id, media, mapPhotoUrl, routeOnlyMapPhotoUrl, hideMap, profile, sport, date, userId } = activity;
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const dispatch = useAppDispatch();
  const isOwnActivity = userId === currentUserId;
  const isTextUnderModeration =
    activity.textModerationStatus === 'pending' || activity.textModerationStatus === 'processing';
  const isTextHiddenByModeration =
    activity.textModerationStatus === 'hidden' || activity.textModerationStatus === 'removed';
  const moderationCopy = ACTIVITY_TEXT_MODERATION_COPY[language];
  const activityForCard =
    !isOwnActivity && activity.textModerationStatus && activity.textModerationStatus !== 'visible'
      ? { ...activity, title: null, description: null }
      : activity;
  const displayedMapPhotoUrl = hideMap
    ? isOwnActivity
      ? (mapPhotoUrl ?? routeOnlyMapPhotoUrl)
      : routeOnlyMapPhotoUrl
    : mapPhotoUrl;
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const mediaWidth = width < MAX_MOBILE_WIDTH ? Math.max(width, 0) : MAX_MOBILE_WIDTH;
  const contextValue = { activity: activityForCard, isFullView, isShowDescription };
  const refreshActivity = useCallback(() => {
    void dispatch(activityApi.util.invalidateTags([Tags.activities, { type: Tags.activities, id }]));
  }, [dispatch, id]);

  useAutoModerationRefresh(isTextUnderModeration, refreshActivity);

  return (
    <ActivityCardContext.Provider value={contextValue}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.outlineVariant,
            width: mediaWidth,
            marginBottom: isFullView ? 0 : 2,
          },
          Platform.OS === 'web' ? styles.webStyles : null,
        ]}>
        <UserInfo profile={profile} sport={sport} date={date} userId={userId} size={UserInfoSize.large} />
        {displayedMapPhotoUrl || Boolean(media?.length) ? <MediaList /> : null}
        {isTextUnderModeration || isTextHiddenByModeration ? (
          <View style={[styles.moderationNotice, { backgroundColor: colors.surfaceVariant }]}>
            <Icon
              source={isTextUnderModeration ? 'clock-outline' : 'eye-off-outline'}
              size={18}
              color={colors.primary}
            />
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, flex: 1 }}>
              {isTextUnderModeration
                ? isOwnActivity
                  ? moderationCopy.pendingOwner
                  : moderationCopy.pendingViewer
                : moderationCopy.hidden}
            </Text>
            {isTextUnderModeration ? (
              <Button mode="text" compact onPress={refreshActivity} style={styles.refreshButton}>
                {moderationCopy.refresh}
              </Button>
            ) : null}
          </View>
        ) : null}
        <Metrics />
        <View style={styles.likes}>
          <Likes />
        </View>
        <Card.Actions style={[styles.actions, Platform.OS === 'web' && styles.webActions]}>
          <LikeBtn />
          <CommentBtn />
          <ShareBtn />
        </Card.Actions>
      </View>
    </ActivityCardContext.Provider>
  );
}

const styles = StyleSheet.create({
  webStyles: {
    maxWidth: 550,
    marginHorizontal: 'auto',
  },
  card: {
    borderCurve: 'continuous',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 2,
    marginHorizontal: 'auto',
    overflow: 'hidden',
    shadowColor: '#262626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    zIndex: 10,
  },
  likes: {
    height: 40,
    paddingHorizontal: 8,
  },
  moderationNotice: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: 12,
    paddingHorizontal: 10,
  },
  refreshButton: { marginVertical: -6 },
  actions: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -6,
    paddingTop: 0,
  },
  webActions: {
    marginTop: 8,
    paddingBottom: 12,
  },
});
