import { useEffect, useState, type RefObject } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { Button, Divider, Icon, Text, useTheme } from 'react-native-paper';
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
import { COMMENT_MODERATION_COPY } from './const';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { CommentResponse } from '@R/runich-api/comment-types';

export default function Comment({
  authorId,
  comment,
  activityId,
  id,
  date,
  profile,
  commentLike,
  commentsModalRef,
  moderationStatus = 'visible',
  onRefreshStatus,
}: CommentResponse & {
  commentsModalRef: RefObject<BottomSheetModal | null>;
  onRefreshStatus?: () => void;
}) {
  const { idOfUpdatingComment, commentActivityId, activityOwnerProfile } = useAppSelector(({ comment }) => comment);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const isYouAuthor = userId === authorId;
  const isActivityOwner = activityOwnerProfile.userId === userId;
  const canInteract = activityOwnerProfile.allowActivityInteractions !== false || isActivityOwner;
  const onEdit = useCommentEditAction(id, comment ?? '');
  const { onDelete, isLoading: isDeletingComment } = useCommentDeleteAction(id, commentActivityId);
  const [commentAnimation] = useState(() => new Animated.Value(0));
  const [isReportVisible, setIsReportVisible] = useState(false);
  const { colors } = useTheme();
  const moderationCopy = COMMENT_MODERATION_COPY[language];
  const isPending = moderationStatus === 'pending' || moderationStatus === 'processing';
  const isHiddenByModeration = moderationStatus === 'hidden' || moderationStatus === 'removed';
  const canViewComment = isYouAuthor || moderationStatus === 'visible';
  const displayedComment = canViewComment ? comment : null;

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
            reportLabel={language === LANGUAGES.russian ? 'Сообщить о нарушении' : 'Report'}
            reportTestID={`report-comment-${id}`}
            onReport={() => setIsReportVisible(true)}
            showReport={!isYouAuthor && !isPending}
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
        {isPending || isHiddenByModeration ? (
          <View style={styles.moderationNotice}>
            <Icon source={isPending ? 'clock-outline' : 'eye-off-outline'} size={17} color={colors.primary} />
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, flex: 1 }}>
              {isPending ? moderationCopy.pending : moderationCopy.hidden}
            </Text>
            {isPending && onRefreshStatus ? (
              <Button mode="text" compact onPress={onRefreshStatus} style={styles.refreshButton}>
                {moderationCopy.refresh}
              </Button>
            ) : null}
          </View>
        ) : null}
        <Text variant="bodyLarge">{displayedComment ?? moderationCopy.hiddenPlaceholder}</Text>
      </View>
      {moderationStatus === 'visible' ? (
        <View style={styles.likesWrapper}>
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            {(canInteract || commentLike.some(({ authorId: likerId }) => likerId === userId)) && (
              <CommentLikeBtn activityId={activityId} commentId={id} commentLikesFromComment={commentLike} />
            )}
            <CommentLikesLength commentId={id} commentLikesFromComment={commentLike} />
          </View>
        </View>
      ) : null}
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
    gap: 4,
  },
  moderationNotice: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  refreshButton: {
    marginVertical: -6,
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
