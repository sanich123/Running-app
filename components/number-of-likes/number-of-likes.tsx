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
  const restLiked = isOwnerLiked ? likes.length - 1 : likes.length;
  return (
    <Text style={{ marginLeft: 65 }} variant="bodyMedium">
      {`${isOwnerLiked ? 'You ' : ''}`}
      {isOwnerLiked && restLiked > 0 ? 'and ' : ''}
      {`${restLiked > 0 ? `${restLiked} ` : ''}gave like${restLiked > 1 ? 's' : ''}`}
    </Text>
  );
}
