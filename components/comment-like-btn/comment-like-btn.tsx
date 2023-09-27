import { useAuth } from '@auth/context/auth-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetLikesByCommentIdQuery, useSendOrDeleteLikeToCommentMutation } from '@r/runnich-api/runnich-api';
import { errorHandler } from '@u/error-handler';
import { useState } from 'react';
import { ToastAndroid } from 'react-native';
import { MD3Colors } from 'react-native-paper';

export default function CommentLikeBtn({ commentId }: { commentId: string }) {
  const { user } = useAuth();
  const [sendLikeToComment] = useSendOrDeleteLikeToCommentMutation();
  const { data: commentLikes } = useGetLikesByCommentIdQuery(commentId);
  const youGaveCommentLike = commentLikes?.some(({ authorId }) => authorId === user?.id);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <MaterialCommunityIcons
      name={`heart${commentLikes?.length ? '' : '-outline'}`}
      size={20}
      style={[{ marginLeft: 10, marginBottom: 10 }, isLoading && { opacity: 0.5 }]}
      color={youGaveCommentLike ? MD3Colors.error50 : MD3Colors.primary50}
      onPress={async () => {
        const body = { commentId, authorId: user.id };
        setIsLoading(true);
        try {
          await sendLikeToComment({ body, commentId })
            .unwrap()
            .then((data) => console.log(data))
            .catch((error) => {
              ToastAndroid.show('Не удалось отправить лайк к комментарию', ToastAndroid.SHORT);
              console.log(error);
            })
            .finally(() => setIsLoading(false));
        } catch (error) {
          errorHandler(error);
        }
      }}
      disabled={isLoading}
    />
  );
}
