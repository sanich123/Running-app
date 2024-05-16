import { CommentType } from '@C/card/const ';
import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { ROUTES } from '@const/enums';
import { usePathname, useRouter } from 'expo-router';
import { useContext, memo } from 'react';
import { View } from 'react-native';
import { IconButton, MD3Colors, Badge } from 'react-native-paper';

import { COMMENT_BTN_TEST_ID, COMMENT_BTN_ICON } from './const';

export default memo(function CommentBtn({ activityId, comments }: { activityId: string; comments: CommentType[] }) {
  const { push } = useRouter();
  const { isLoading, isDisabled } = useContext(ActivityCardBtnsContext);
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
  return (
    <View style={{ position: 'relative' }}>
      {comments?.length ? (
        <Badge style={{ position: 'absolute', top: 5, right: 8, zIndex: 10, backgroundColor: MD3Colors.primary50 }}>
          {comments.length}
        </Badge>
      ) : null}

      <IconButton
        testID={COMMENT_BTN_TEST_ID}
        icon={COMMENT_BTN_ICON}
        iconColor={MD3Colors.primary50}
        size={25}
        onPress={() => push(`/${place}/${ROUTES.comment}/${activityId}`)}
        disabled={isLoading || isDisabled}
      />
    </View>
  );
});
