import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

type Likes = {
  authorId: string;
  activityId: string;
  date: Date;
  id: string;
};

export default function NumberOfLikes({ likes }: { likes: Likes[] }) {
  const { id: ownerId } = useSelector(({ userInfo }) => userInfo);
  const isOwnerLiked = likes.some(({ authorId }) => authorId === ownerId);
  return (
    <Text style={{ marginLeft: 65 }} variant="bodyMedium">
      {`${isOwnerLiked ? 'You and ' : ''}`}
      {`${isOwnerLiked ? likes.length - 1 : likes.length} gave like${likes.length > 1 ? 's' : ''}`}
    </Text>
  );
}
