import { useAuth } from '@A/context/auth-context';
import { useSendOrDeleteLikeToCommentMutation, useGetLikesByCommentIdQuery } from '@R/runich-api/runich-api';
import { errorHandler } from '@U/error-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ToastAndroid } from 'react-native';
import { MD3Colors } from 'react-native-paper';

export default function CommentLikeBtn({ commentId }: { commentId: string }) {
  const { user } = useAuth();
  const [sendLikeToComment, { data, error }] = useSendOrDeleteLikeToCommentMutation();
  const { isError, data: commentLikes } = useGetLikesByCommentIdQuery(commentId);
  const youGaveCommentLike = commentLikes?.some(({ authorId }: { authorId: string }) => authorId === user?.id);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (data) {
      console.log(data);
    }
    if (error) {
      ToastAndroid.show('Не удалось отправить лайк к комментарию', ToastAndroid.SHORT);
      console.log(error);
    }
  }, [data, error]);

  return (
    <MaterialCommunityIcons
      testID={`commentLikeBtn${youGaveCommentLike ? '-active' : ''}`}
      name={`heart${commentLikes?.length ? '' : '-outline'}`}
      size={20}
      style={[{ marginLeft: 10, marginBottom: 10 }, (isLoading || isError) && { opacity: 0.5 }]}
      color={youGaveCommentLike ? MD3Colors.error50 : MD3Colors.primary50}
      onPress={async () => {
        if (user) {
          const body = { commentId, authorId: user.id };
          setIsLoading(true);
          try {
            await sendLikeToComment({ body, commentId }).unwrap();
          } catch (error) {
            errorHandler(error);
          } finally {
            setIsLoading(false);
          }
        }
      }}
      disabled={isLoading || isError}
    />
  );
}
