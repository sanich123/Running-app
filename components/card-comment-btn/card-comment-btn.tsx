import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { IconButton, MD3Colors } from 'react-native-paper';

import { ActivityCardBtnsContext } from '../../utils/context/activity-card-btns';

export default function ActivityCardCommentBtn({ activityId }: { activityId: string }) {
  const { push } = useRouter();
  const { isLoading, isDisabled } = useContext(ActivityCardBtnsContext);
  return (
    <IconButton
      testID="activityCardCommentBtnIcon"
      icon="comment-outline"
      iconColor={MD3Colors.primary50}
      size={25}
      onPress={() => push(`/home/comment/${activityId}`)}
      disabled={isLoading || isDisabled}
    />
  );
}
