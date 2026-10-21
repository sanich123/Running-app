import { useEffect, useState, type RefObject } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { UserInfoSize } from '@S/card/user-info/const';
import UserInfo from '@S/card/user-info/user-info';
import ContentActionsMenu from '@S/moderation/content-actions-menu/content-actions-menu';
import ReportContentDialog from '@S/moderation/report-content-dialog/report-content-dialog';
import CommentDeleteBtn from '../comment-delete-btn/comment-delete-btn';
import CommentEditBtn from '../comment-edit-btn/comment-edit-btn';
import CommentLikeBtn from '../comment-like-btn/comment-like-btn';
import CommentLikesLength from '../comment-likes-length/comment-likes-length';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { CommentResponse } from '@R/runich-api/types';

export default function Comment({
  authorId,
  comment,
  activityId,
  id,
  date,
  profile,
  commentLike,
  commentsModalRef,
}: CommentResponse & { commentsModalRef: RefObject<BottomSheetModal | null> }) {
  const { idOfUpdatingComment, commentActivityId, activityOwnerProfile } = useAppSelector(({ comment }) => comment);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const isYouAuthor = userId === authorId;
  const isActivityOwner = activityOwnerProfile.userId === userId;
  const canInteract = activityOwnerProfile.allowActivityInteractions !== false || isActivityOwner;
  const [commentAnimation] = useState(() => new Animated.Value(0));
  const [isReportVisible, setIsReportVisible] = useState(false);

  useEffect(() => {
    Animated.timing(commentAnimation, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [commentAnimation]);

  return (
    <Animated.View
      style={{
        opacity: commentAnimation,
        transform: [
          {
            translateY: commentAnimation.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }),
          },
        ],
      }}>
      <View style={{ padding: 10 }}>
        <UserInfo
          profile={profile}
          date={date}
          userId={authorId}
          size={UserInfoSize.small}
          commentsModalRef={commentsModalRef}
        />
      </View>
      <View style={styles.textCommentWrapper}>
        <Text variant="bodyLarge">{comment}</Text>
      </View>
      <View style={styles.likesWrapper}>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          {(canInteract || commentLike.some(({ authorId: likerId }) => likerId === userId)) && (
            <CommentLikeBtn activityId={activityId} commentId={id} commentLikesFromComment={commentLike} />
          )}
          <CommentLikesLength commentId={id} commentLikesFromComment={commentLike} />
        </View>
        <View style={styles.actions}>
          {!isYouAuthor ? (
            <ContentActionsMenu
              accessibilityLabel={
                language === LANGUAGES.russian ? 'Дополнительные действия с комментарием' : 'Comment actions'
              }
              testID={`comment-actions-menu-${id}`}
              reportLabel={language === LANGUAGES.russian ? 'Пожаловаться' : 'Report'}
              reportTestID={`report-comment-${id}`}
              onReport={() => setIsReportVisible(true)}
            />
          ) : null}
          {isYouAuthor && <CommentEditBtn commentId={id} comment={comment} idOfUpdatingComment={idOfUpdatingComment} />}
          {(isYouAuthor || isActivityOwner) && <CommentDeleteBtn commentId={id} activityId={commentActivityId} />}
        </View>
      </View>
      <ReportContentDialog
        visible={isReportVisible}
        targetType="comment"
        targetId={id}
        onDismiss={() => setIsReportVisible(false)}
      />
      <Divider />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  commentWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    paddingTop: 5,
    paddingLeft: 10,
    paddingBottom: 5,
  },
  textCommentWrapper: {
    marginLeft: 10,
  },
  likesWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingRight: 10,
  },
  dateTimeWrapper: {
    display: 'flex',
    flexDirection: 'row',
  },
  floatingBtn: {
    position: 'absolute',
    margin: 16,
    right: 0,
    top: -60,
  },
});
