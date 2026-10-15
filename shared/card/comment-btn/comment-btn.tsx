import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, TouchableRipple, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
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
  const { language } = useAppSelector(({ settings }) => settings);
  const { activity } = useActivityCard();
  const { id: activityId, userId: activityOwnerId, profile } = activity;
  const canViewComments = profile?.allowActivityInteractions !== false || activityOwnerId === userId;
  const commentsModalRef = useRef<BottomSheetModal>(null);

  const isButtonDisabled = isLoading || !canViewComments;
  const buttonLabel = language === LANGUAGES.russian ? 'Открыть комментарии' : 'Open comments';
  const openComments = () => {
    void dispatch(
      commentsApi.endpoints.getCommentsByActivityId.initiate({ activityId }, { subscribe: false, forceRefetch: true }),
    );
    void dispatch(
      commentsApi.endpoints.getCommentsLengthByActivityId.initiate(activityId, {
        subscribe: false,
        forceRefetch: true,
      }),
    );
    dispatch(setCommentToUpdate(''));
    dispatch(setIdOfUpdatingComment(''));
    dispatch(setCommentActivityId(activityId));
    dispatch(setActivityOwnerProfile(profile));
    commentsModalRef.current?.present?.();
  };

  return (
    <View testID="activity-card-comment-button">
      <TouchableRipple
        testID={COMMENT_BTN_TEST_ID}
        style={styles.container}
        borderless
        accessibilityRole="button"
        accessibilityLabel={buttonLabel}
        onPress={openComments}
        disabled={isButtonDisabled}>
        <View pointerEvents="none" style={styles.contents}>
          <CommentCountBadge activity={activity} />
          <Icon
            source={COMMENT_BTN_ICON}
            color={isButtonDisabled ? colors.onSurfaceDisabled : colors.primary}
            size={25}
          />
        </View>
      </TouchableRipple>
      <CommentsListModal commentsModalRef={commentsModalRef} allowNewComments={canViewComments} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 50,
    width: 57,
    height: 57,
  },
  contents: {
    position: 'relative',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
