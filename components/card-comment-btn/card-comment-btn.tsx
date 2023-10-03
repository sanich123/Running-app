import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { IconButton, MD3Colors } from 'react-native-paper';

import { ActivityCardBtnsContext } from '../../utils/context/activity-card-btns';

export default function ActivityCardCommentBtn({ activityId }: { activityId: string }) {
  const router = useRouter();
  const { isLoading, isDisabled } = useContext(ActivityCardBtnsContext);
  return (
    <IconButton
      icon="comment-outline"
      iconColor={MD3Colors.primary50}
      size={25}
      onPress={() => router.push(`/home/comment/${activityId}`)}
      disabled={isLoading || isDisabled}
    />
  );
}