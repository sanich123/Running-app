import { useGetCommentsLengthByActivityIdQuery } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { ROUTES } from '@const/enums';
import { Href, usePathname, useRouter } from 'expo-router';
import { useContext, memo, useState, useEffect, useRef } from 'react';
import { Platform, View } from 'react-native';
import { IconButton, MD3Colors, Badge } from 'react-native-paper';
import { COMMENT_BTN_TEST_ID, COMMENT_BTN_ICON } from './const';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import CommentsListModal from '@C/comment-page/comments-list-modal/comments-list-modal';
import { CommentBtnProps } from '../types';

export default memo(function CommentBtn({ activityId, commentsLength }: CommentBtnProps) {
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
    <View style={{ position: 'relative' }}>
      {whatLengthToRender ? (
        <Badge style={{ position: 'absolute', top: 5, right: 8, zIndex: 10, backgroundColor: MD3Colors.primary50 }}>
          {whatLengthToRender}
        </Badge>
      ) : null}
      <IconButton
        testID={COMMENT_BTN_TEST_ID}
        icon={COMMENT_BTN_ICON}
        iconColor={MD3Colors.primary50}
        size={25}
        onPress={() => {
          if (Platform.OS === 'web') {
            push(`/${place}/${ROUTES.comment}/${activityId}` as Href);
          } else {
            commentsModalRef.current?.present();
          }
        }}
        disabled={isLoading || isDisabled || !!commentsCount?.message || isErrorLoadingComments || isLoadingComments}
      />
      <CommentsListModal commentsModalRef={commentsModalRef} activityId={activityId} />
    </View>
  );
});
