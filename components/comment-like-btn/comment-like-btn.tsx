import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetLikesByCommentIdQuery, useSendOrDeleteLikeToCommentMutation } from '@r/runnich-api/runnich-api';
import { useEffect } from 'react';
import { ToastAndroid } from 'react-native';
import { useSelector } from 'react-redux';

export default function CommentLikeBtn({ commentId }: { commentId: string }) {
  const { id: ownerId } = useSelector(({ userInfo }) => userInfo);
  const [sendLikeToComment, { isLoading, data, error }] = useSendOrDeleteLikeToCommentMutation();
  useEffect(() => {
    if (data) {
      console.log(data);
    }
    if (error) {
      ToastAndroid.show('Не удалось отправить лайк к комментарию', ToastAndroid.SHORT);
      console.log(error);
    }
  }, [data, error]);
  const { data: commentLikes } = useGetLikesByCommentIdQuery(commentId);
  const youGaveCommentLike = commentLikes?.some(({ authorId }) => authorId === ownerId);

  return (
    <MaterialCommunityIcons
      name={`heart${commentLikes?.length ? '' : '-outline'}`}
      size={20}
      style={[{ marginLeft: 10, marginBottom: 10 }, isLoading && { opacity: 0.5 }]}
      color={youGaveCommentLike ? 'red' : 'black'}
      onPress={async () => {
        const body = { commentId, authorId: ownerId };
        await sendLikeToComment({ body, commentId }).unwrap();
      }}
      disabled={isLoading}
    />
  );
}
