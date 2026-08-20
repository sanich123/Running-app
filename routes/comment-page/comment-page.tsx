import { useEffect } from 'react';
import { Platform, useWindowDimensions, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator, Card, Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetActivityByActivityIdQuery } from '@R/services/activity/activity';
import { setActivityOwnerProfile, setCommentActivityId } from '@R/slices/comment/comment';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import UserNameSurname from '@Routes/comment-page/user-name-surname/user-name-surname';
import UserSportDate from '@Routes/comment-page/user-sport-date/user-sport-date';
import LikeBtn from '@S/card/like-btn/like-btn';
import { LikesSize } from '@S/card/likes/const';
import Likes from '@S/card/likes/likes';
import CommentAddBtn from '@S/comments/comment-add-btn/comment-add-btn';
import CommentInput from '@S/comments/comment-input/comment-input';
import Comments from '@S/comments/comments/comments';
import MediaList from '@S/card/media-list/media-list';
import ErrorComponent from '@S/error-component/error-component';
import type { SPORTS_BTNS_VALUES } from '@const/sports';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

const ComposerKeyboardView = KeyboardStickyView ?? View;

export default function CommentFullViewPage() {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { id: activityId } = useLocalSearchParams();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { isShowingTextInput, idOfUpdatingComment } = useAppSelector(({ comment }) => comment);
  const {
    isLoading,
    data: activity,
    error,
    isError,
    isSuccess,
    refetch,
  } = useGetActivityByActivityIdQuery(`${activityId}`, { skip: !activityId });

  useEffect(() => {
    if (activity) {
      dispatch(setCommentActivityId(activity.id));
      dispatch(setActivityOwnerProfile(activity.profile));
    }
  }, [activity, dispatch]);

  const activityHeader = activity ? (
    <View style={Platform.OS === 'web' ? styles.webContent : styles.nativeContent}>
      {(activity?.mapPhotoUrl || Boolean(activity?.photoVideoUrls?.length)) && (
        <MediaList
          photoVideoUrls={activity.photoVideoUrls ?? []}
          mapPhotoUrl={activity.mapPhotoUrl}
          id={`${activityId}`}
        />
      )}
      <Card.Content style={styles.contentLayout}>
        <Text variant="titleLarge" style={styles.title}>
          {activity.title}
        </Text>
        <UserNameSurname userId={activity.user_id} size="titleMedium" />
        <View style={styles.columnsLayout}>
          <UserSportDate sport={activity.sport as SPORTS_BTNS_VALUES} date={activity.date} />
          <Text variant="bodyMedium">{` ${activity.distance / 1000} км`}</Text>
        </View>
        <View style={styles.columnsLayout}>
          <LikeBtn activityId={activity.id} profile={activity.profile} />
          <Likes activityId={activity.id} size={LikesSize.big} />
        </View>
      </Card.Content>
    </View>
  ) : null;

  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      {isLoading ? (
        <View style={styles.isInCenter}>
          <ActivityIndicator size="large" testID="comment-page-loading" />
        </View>
      ) : isSuccess && activity ? (
        <Comments
          commentsModalRef={{
            current: {
              present: () => {},
            } as BottomSheetModalMethods,
          }}
          headerComponent={activityHeader}
          contentContainerStyle={{ paddingBottom: isShowingTextInput ? 190 : 100 }}
        />
      ) : isError ? (
        <ErrorComponent error={error} refetch={refetch} />
      ) : null}
      {isSuccess && activity && (
        <ComposerKeyboardView>
          <View
            style={[
              styles.composer,
              {
                width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
                marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
                backgroundColor: colors.surface,
                borderTopColor: colors.outlineVariant,
                paddingBottom: Math.max(bottomInset, 8),
              },
            ]}>
            {isShowingTextInput && !idOfUpdatingComment ? (
              <CommentInput profile={activity.profile} commentId="" />
            ) : (
              <CommentAddBtn />
            )}
          </View>
        </ComposerKeyboardView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  isInCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeContent: {
    width: '100%',
  },
  webContent: {
    width: '100%',
  },
  composer: {
    borderTopWidth: 1,
    paddingBottom: 8,
  },
  contentLayout: {
    display: 'flex',
    columnGap: 5,
    marginBottom: 10,
  },
  columnsLayout: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
});
