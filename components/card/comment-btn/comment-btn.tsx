import { useGetCommentsLengthByActivityIdQuery } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { ROUTES } from '@const/enums';
import { Href, usePathname, useRouter } from 'expo-router';
import { useContext, memo, useState, useEffect, useRef } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { IconButton, Badge, TouchableRipple, useTheme } from 'react-native-paper';
import { COMMENT_BTN_TEST_ID, COMMENT_BTN_ICON } from './const';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import CommentsListModal from '@C/comment-page/comments-list-modal/comments-list-modal';
import { CommentBtnProps } from '../types';

export default memo(function CommentBtn({ activityId, commentsLength }: CommentBtnProps) {
  const { dark, colors } = useTheme();
  const { push } = useRouter();
  const { isLoading, isDisabled } = useContext(ActivityCardBtnsContext);
  const { activityIdWhichCommentsToUpdate } = useAppSelector(({ mainFeed }) => mainFeed);
  const [isNeedToGetUpdatedComments, setIsNeedToGetUpdatedComments] = useState(false);
  const {
    data: commentsCount,
    isError: isErrorLoadingComments,
    isLoading: isLoadingComments,
  } = useGetCommentsLengthByActivityIdQuery(`${activityId}`, { skip: !isNeedToGetUpdatedComments });
  const whatLengthToRender = !isNeedToGetUpdatedComments ? commentsLength : commentsCount;
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
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
        if (Platform.OS === 'web') {
          push(`/${place}/${ROUTES.comment}/${activityId}` as Href);
        } else {
          commentsModalRef.current?.present();
        }
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
          disabled={isLoading || isDisabled || !!commentsCount?.message || isErrorLoadingComments || isLoadingComments}
        />
        <CommentsListModal commentsModalRef={commentsModalRef} activityId={activityId} />
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
