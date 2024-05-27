import { useGetCommentsByActivityIdQuery } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { ROUTES } from '@const/enums';
import { usePathname, useRouter } from 'expo-router';
import { useContext, memo, useState, useEffect } from 'react';
import { View } from 'react-native';
import { IconButton, MD3Colors, Badge } from 'react-native-paper';

import { COMMENT_BTN_TEST_ID, COMMENT_BTN_ICON } from './const';

export default memo(function CommentBtn({
  activityId,
  commentsLength,
}: {
  activityId: string;
  commentsLength: number;
}) {
  const { push } = useRouter();
  const { isLoading, isDisabled } = useContext(ActivityCardBtnsContext);
  const { activityIdWhichCommentsToUpdate } = useAppSelector(({ mainFeed }) => mainFeed);
  const [isNeedToGetUpdatedComments, setIsNeedToGetUpdatedComments] = useState(false);
  const {
    data: comments,
    isError: isErrorLoadingComments,
    isLoading: isLoadingComments,
  } = useGetCommentsByActivityIdQuery(`${activityId}`, { skip: !isNeedToGetUpdatedComments });
  const whatLengthToRender = !isNeedToGetUpdatedComments ? commentsLength : comments?.length;
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;

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
        onPress={() => push(`/${place}/${ROUTES.comment}/${activityId}`)}
        disabled={isLoading || isDisabled || !!comments?.message || isErrorLoadingComments || isLoadingComments}
      />
    </View>
  );
});
