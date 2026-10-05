import { useState, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { IconButton, Badge, TouchableRipple, useTheme } from 'react-native-paper';
import { useGetCommentsLengthByActivityIdQuery } from '@R/services/comments/comments';
import {
  setCommentActivityId,
  setCommentToUpdate,
  setActivityOwnerProfile,
  setMapPhotoUrl,
  setCommentsLength,
  setIdOfUpdatingComment,
} from '@R/slices/comment/comment';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import CommentsListModal from '@S/comments/comments-list-modal/comments-list-modal';
import { COMMENT_BTN_TEST_ID, COMMENT_BTN_ICON } from './const';
import { useActivityCard } from '../context';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function CommentBtn() {
  const { activity } = useActivityCard();
  const { id: activityId, userId: activityOwnerId, commentsLength, profile, mapPhotoUrl } = activity;
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { isLoading } = useAppSelector(({ loading }) => loading);
  const { activityIdWhichCommentsToUpdate } = useAppSelector(({ mainFeed }) => mainFeed);
  const [isNeedToGetUpdatedComments, setIsNeedToGetUpdatedComments] = useState(false);
  const {
    data: commentsCount,
    isError: isErrorLoadingComments,
    isLoading: isLoadingComments,
  } = useGetCommentsLengthByActivityIdQuery(`${activityId}`, { skip: !isNeedToGetUpdatedComments });
  const whatLengthToRender = !isNeedToGetUpdatedComments ? commentsLength : commentsCount;
  const commentsModalRef = useRef<BottomSheetModal>(null);
  const isInteractionDisabled = profile?.allowActivityInteractions === false && activityOwnerId !== userId;

  useEffect(() => {
    if (activityIdWhichCommentsToUpdate === activityId) {
      setIsNeedToGetUpdatedComments(true);
    }
  }, [activityIdWhichCommentsToUpdate, activityId]);

  return (
    <TouchableRipple
      testID="activity-card-comment-button"
      style={styles.container}
      borderless
      disabled={isLoading || isErrorLoadingComments || isLoadingComments || isInteractionDisabled}
      onPress={() => {
        dispatch(setCommentToUpdate(''));
        dispatch(setIdOfUpdatingComment(''));
        dispatch(setCommentsLength(commentsLength));
        dispatch(setCommentActivityId(activityId));
        dispatch(setActivityOwnerProfile(profile));
        dispatch(setMapPhotoUrl(mapPhotoUrl));
        commentsModalRef.current?.present?.();
      }}>
      <>
        {whatLengthToRender ? (
          <Badge style={{ ...styles.badge, backgroundColor: colors.primary }}>{whatLengthToRender}</Badge>
        ) : null}
        <IconButton
          testID={COMMENT_BTN_TEST_ID}
          icon={COMMENT_BTN_ICON}
          iconColor={colors.primary}
          size={25}
          disabled={isLoading || isErrorLoadingComments || isLoadingComments || isInteractionDisabled}
        />
        <CommentsListModal
          commentsModalRef={commentsModalRef}
          commentsLength={commentsLength}
          allowNewComments={!isInteractionDisabled}
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
  container: {
    position: 'relative',
    borderRadius: 50,
    padding: 2,
  },
});
