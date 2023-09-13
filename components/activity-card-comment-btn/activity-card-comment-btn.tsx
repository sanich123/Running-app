import { useRouter } from 'expo-router';
import { IconButton, MD3Colors } from 'react-native-paper';

export default function ActivityCardCommentBtn({ activityId }: { activityId: string }) {
  const router = useRouter();
  return (
    <IconButton
      icon="comment-outline"
      iconColor={MD3Colors.primary50}
      size={25}
      onPress={() => router.push(`/home/comment/${activityId}`)}
    />
  );
}
