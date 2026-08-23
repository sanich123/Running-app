import { useContext, memo, useState, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { IconButton, Badge, TouchableRipple, useTheme } from 'react-native-paper';
import { useGetCommentsLengthByActivityIdQuery } from '@R/services/comments/comments';
import {
  setCommentActivityId,
  setActivityOwnerProfile,
  setMapPhotoUrl,
  setCommentsLength,
} from '@R/slices/comment/comment';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import CommentsListModal from '@S/comments/comments-list-modal/comments-list-modal';
import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { COMMENT_BTN_TEST_ID, COMMENT_BTN_ICON } from './const';
import type { CommentBtnProps } from '../types';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export default memo(function CommentBtn({ activityId, commentsLength, profile, mapPhotoUrl }: CommentBtnProps) {
  const dispatch = useAppDispatch();
  const { dark, colors } = useTheme();
  const { isLoading, isDisabled } = useContext(ActivityCardBtnsContext);
  const { activityIdWhichCommentsToUpdate } = useAppSelector(({ mainFeed }) => mainFeed);
  const [isNeedToGetUpdatedComments, setIsNeedToGetUpdatedComments] = useState(false);
  const {
    data: commentsCount,
    isError: isErrorLoadingComments,
    isLoading: isLoadingComments,
  } = useGetCommentsLengthByActivityIdQuery(`${activityId}`, { skip: !isNeedToGetUpdatedComments });
  const whatLengthToRender = !isNeedToGetUpdatedComments ? commentsLength : commentsCount;
  const commentsModalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (activityIdWhichCommentsToUpdate === activityId) {
      setIsNeedToGetUpdatedComments(true);
    }
  }, [activityIdWhichCommentsToUpdate, activityId]);

  return (
    <TouchableRipple
      style={styles.container}
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      onPress={() => {
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
          disabled={isLoading || isDisabled || isErrorLoadingComments || isLoadingComments}
        />
        <CommentsListModal commentsModalRef={commentsModalRef} commentsLength={commentsLength} />
      </>
    </TouchableRipple>
  );
});

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
