import { useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { IconButton, Badge, TouchableRipple, useTheme } from 'react-native-paper';
import { commentsApi, useGetCommentsLengthByActivityIdQuery } from '@R/services/comments/comments';
import {
  setCommentActivityId,
  setCommentToUpdate,
  setActivityOwnerProfile,
  setIdOfUpdatingComment,
} from '@R/slices/comment/comment';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import CommentsListModal from '@S/comments/comments-list-modal/comments-list-modal';
import { COMMENT_BTN_TEST_ID, COMMENT_BTN_ICON } from './const';
import { useActivityCard } from '../context';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function CommentBtn() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { isLoading } = useAppSelector(({ loading }) => loading);
  const { activity } = useActivityCard();
  const { id: activityId, userId: activityOwnerId, commentsLength, profile } = activity;
  const [isNeedToGetUpdatedComments, setIsNeedToGetUpdatedComments] = useState(false);
  const {
    data: commentsCount,
    isError,
    isLoading: isLoadingComments,
  } = useGetCommentsLengthByActivityIdQuery(activityId, { skip: !isNeedToGetUpdatedComments });
  const whatLengthToRender = !isNeedToGetUpdatedComments ? commentsLength : commentsCount;
  const commentsModalRef = useRef<BottomSheetModal>(null);
  const canViewComments = profile?.allowActivityInteractions !== false || activityOwnerId === userId;

  const isButtonDisabled = isLoading || isError || isLoadingComments || !canViewComments;

  return (
    <TouchableRipple
      testID="activity-card-comment-button"
      style={styles.container}
      borderless
      disabled={isButtonDisabled}
      onPress={() => {
        void dispatch(commentsApi.endpoints.getCommentsByActivityId.initiate({ activityId }, { subscribe: false }));
        setIsNeedToGetUpdatedComments(true);
        dispatch(setCommentToUpdate(''));
        dispatch(setIdOfUpdatingComment(''));
        dispatch(setCommentActivityId(activityId));
        dispatch(setActivityOwnerProfile(profile));
        commentsModalRef.current?.present?.();
      }}>
      <>
        {canViewComments && whatLengthToRender ? (
          <Badge style={[styles.badge, { backgroundColor: colors.primary }, isButtonDisabled && styles.disabled]}>
            {whatLengthToRender}
          </Badge>
        ) : null}
        <IconButton
          testID={COMMENT_BTN_TEST_ID}
          icon={COMMENT_BTN_ICON}
          iconColor={isButtonDisabled ? colors.onSurfaceDisabled : colors.primary}
          size={25}
          disabled={isButtonDisabled}
        />
        <CommentsListModal
          commentsModalRef={commentsModalRef}
          commentsLength={commentsLength}
          allowNewComments={canViewComments}
        />
      </>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 8,
    right: 10,
    zIndex: 10,
  },
  disabled: {
    opacity: 0.38,
  },
  container: {
    position: 'relative',
    borderRadius: 50,
    padding: 2,
  },
});
