import { useEffect, useState, type RefObject } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { UserInfoSize } from '@S/card/user-info/const';
import UserInfo from '@S/card/user-info/user-info';
import ContentActionsMenu from '@S/moderation/content-actions-menu/content-actions-menu';
import ReportContentDialog from '@S/moderation/report-content-dialog/report-content-dialog';
import { COMMENT_DELETE_BTN } from '../comment-delete-btn/const';
import useCommentDeleteAction from '../comment-delete-btn/use-comment-delete-action';
import { COMMENT_EDIT_BTN } from '../comment-edit-btn/const';
import useCommentEditAction from '../comment-edit-btn/use-comment-edit-action';
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
  const onEdit = useCommentEditAction(id, comment);
  const { onDelete, isLoading: isDeletingComment } = useCommentDeleteAction(id, commentActivityId);
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
      <View style={styles.header}>
        <View style={styles.author}>
          <UserInfo
            profile={profile}
            date={date}
            userId={authorId}
            size={UserInfoSize.small}
            commentsModalRef={commentsModalRef}
          />
        </View>
        <View style={styles.actions}>
          <ContentActionsMenu
            accessibilityLabel={
              language === LANGUAGES.russian ? 'Дополнительные действия с комментарием' : 'Comment actions'
            }
            testID={`comment-actions-menu-${id}`}
            reportLabel={language === LANGUAGES.russian ? 'Пожаловаться' : 'Report'}
            reportTestID={`report-comment-${id}`}
            onReport={() => setIsReportVisible(true)}
            showReport={!isYouAuthor}
            additionalActions={[
              ...(!isYouAuthor || idOfUpdatingComment === id
                ? []
                : [
                    {
                      label: COMMENT_EDIT_BTN[language].label,
                      testID: `edit-comment-${id}`,
                      leadingIcon: 'pencil-outline',
                      systemImage: 'pencil' as const,
                      onPress: onEdit,
                    },
                  ]),
              ...(!isYouAuthor && !isActivityOwner
                ? []
                : [
                    {
                      label: COMMENT_DELETE_BTN[language].label,
                      testID: `delete-comment-${id}`,
                      leadingIcon: 'delete-outline',
                      systemImage: 'trash' as const,
                      onPress: () => void onDelete(),
                      destructive: true,
                      disabled: isDeletingComment,
                    },
                  ]),
            ]}
          />
        </View>
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  author: { flex: 1, minWidth: 0 },
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
  actions: { alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
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
