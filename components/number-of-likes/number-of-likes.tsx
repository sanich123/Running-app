import { useAuth } from '@auth/context/auth-context';
import { Text } from 'react-native-paper';

type Likes = {
  authorId: string;
  activityId: string;
  date: Date;
  id: string;
};

export default function NumberOfLikes({ likes }: { likes: Likes[] }) {
  const { user } = useAuth();
  const isOwnerLiked = likes.some(({ authorId }) => authorId === user?.id);
  const restLiked = isOwnerLiked ? likes.length - 1 : likes.length;
  return (
    <Text style={{ marginLeft: 65 }} variant="bodyMedium">
      {`${isOwnerLiked ? 'You ' : ''}`}
      {isOwnerLiked && restLiked > 0 ? 'and ' : ''}
      {`${restLiked > 0 ? `${restLiked} ` : ''}gave like${restLiked > 1 ? 's' : ''}`}
    </Text>
  );
}
