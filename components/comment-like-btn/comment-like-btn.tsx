import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { useGetLikesByCommentIdQuery, useSendOrDeleteLikeToCommentMutation } from '../../redux/runnich-api/runnich-api';

export default function CommentLikeBtn({ commentId }: { commentId: string }) {
  const { id: ownerId } = useSelector(({ userInfo }) => userInfo);
  const [sendLikeToComment, { isLoading, data, error }] = useSendOrDeleteLikeToCommentMutation();
  useEffect(() => {
    if (data) {
      console.log(data);
    }
    if (error) {
      console.log(error);
    }
  }, [data, error]);
  const { data: commentLikes } = useGetLikesByCommentIdQuery(commentId);
  const youGaveCommentLike = commentLikes?.some(({ authorId }) => authorId === ownerId);
  return (
    <MaterialCommunityIcons
      name={`heart${youGaveCommentLike ? '' : '-outline'}`}
      size={20}
      style={[{ marginLeft: 10, marginBottom: 10 }, isLoading && { opacity: 0.5 }]}
      onPress={async () => {
        const body = { commentId, authorId: ownerId };
        await sendLikeToComment({ body, commentId }).unwrap();
      }}
      disabled={isLoading}
    />
  );
}
