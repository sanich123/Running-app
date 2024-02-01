import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { ROUTES } from '@const/enums';
import { useRouter } from 'expo-router';
import { useContext, memo } from 'react';
import { IconButton, MD3Colors } from 'react-native-paper';

import { COMMENT_BTN_TEST_ID, COMMENT_BTN_ICON } from './const';

export default memo(function ActivityCardCommentBtn({ activityId }: { activityId: string }) {
  const { push } = useRouter();
  const { isLoading, isDisabled } = useContext(ActivityCardBtnsContext);
  return (
    <IconButton
      testID={COMMENT_BTN_TEST_ID}
      icon={COMMENT_BTN_ICON}
      iconColor={MD3Colors.primary50}
      size={25}
      onPress={() => push(`/${ROUTES.home}/${ROUTES.comment}/${activityId}`)}
      disabled={isLoading || isDisabled}
    />
  );
});
