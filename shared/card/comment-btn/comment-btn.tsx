import { useRef } from 'react';
import { StyleSheet } from 'react-native';
import { IconButton, TouchableRipple, useTheme } from 'react-native-paper';
import { commentsApi } from '@R/services/comments/comments';
import {
  setCommentActivityId,
  setCommentToUpdate,
  setActivityOwnerProfile,
  setIdOfUpdatingComment,
} from '@R/slices/comment/comment';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import CommentsListModal from '@S/comments/comments-list-modal/comments-list-modal';
import CommentCountBadge from './comment-count-badge';
import { COMMENT_BTN_TEST_ID, COMMENT_BTN_ICON } from './const';
import { useActivityCard } from '../context';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function CommentBtn() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { isLoading } = useAppSelector(({ loading }) => loading);
  const { activity } = useActivityCard();
  const { id: activityId, userId: activityOwnerId, profile } = activity;
  const canViewComments = profile?.allowActivityInteractions !== false || activityOwnerId === userId;
  const commentsModalRef = useRef<BottomSheetModal>(null);

  const isButtonDisabled = isLoading || !canViewComments;

  return (
    <TouchableRipple
      testID="activity-card-comment-button"
      style={styles.container}
      borderless
      disabled={isButtonDisabled}
      onPress={() => {
        void dispatch(commentsApi.endpoints.getCommentsByActivityId.initiate({ activityId }, { subscribe: false }));
        dispatch(setCommentToUpdate(''));
        dispatch(setIdOfUpdatingComment(''));
        dispatch(setCommentActivityId(activityId));
        dispatch(setActivityOwnerProfile(profile));
        commentsModalRef.current?.present?.();
      }}>
      <>
        <CommentCountBadge activity={activity} />
        <IconButton
          testID={COMMENT_BTN_TEST_ID}
          icon={COMMENT_BTN_ICON}
          iconColor={isButtonDisabled ? colors.onSurfaceDisabled : colors.primary}
          size={25}
          disabled={isButtonDisabled}
        />
        <CommentsListModal commentsModalRef={commentsModalRef} allowNewComments={canViewComments} />
      </>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 50,
    padding: 2,
  },
});
