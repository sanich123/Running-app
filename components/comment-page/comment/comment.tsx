import { useAuth } from '@A/context/auth-context';
import { UserInfoSize } from '@C/card/user-info/const';
import UserInfo from '@C/card/user-info/user-info';
import { View, StyleSheet } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import CommentDeleteBtn from '../comment-delete-btn/comment-delete-btn';
import CommentEditBtn from '../comment-edit-btn/comment-edit-btn';
import CommentInput from '../comment-input/comment-input';
import CommentLikeBtn from '../comment-like-btn/comment-like-btn';
import CommentLikesLength from '../comment-likes-length/comment-likes-length';
import { CommentProps } from '../types';

export default function Comment({
  authorId,
  comment,
  id,
  date,
  profile,
  activityId,
  idOfUpdatingComment,
  setIdOfUpdatingComment,
  setIsShowingTextInput,
  commentLike,
  mapPhotoUrl,
}: CommentProps) {
  const { user } = useAuth();
  const isYouAuthor = user?.id === authorId;

  return (
    <>
      <View style={{ padding: 10 }}>
        <UserInfo profile={profile} date={date} userId={authorId} size={UserInfoSize.small} />
      </View>

      <View style={styles.textCommentWrapper}>
        {idOfUpdatingComment === id ? (
          <CommentInput
            mapPhotoUrl={mapPhotoUrl}
            profile={profile}
            activityId={activityId}
            setIsShowingTextInput={setIsShowingTextInput}
            commentToUpdate={comment}
            commentId={id}
            setIdOfUpdatingComment={setIdOfUpdatingComment}
            idOfUpdatingComment={idOfUpdatingComment}
          />
        ) : (
          <Text variant="bodyLarge">{comment}</Text>
        )}
      </View>
      <View style={styles.likesWrapper}>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <CommentLikeBtn commentId={id} commentLikesFromComment={commentLike} profile={profile} comment={comment} />
          <CommentLikesLength commentId={id} commentLikesFromComment={commentLike} />
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          {isYouAuthor && (
            <CommentEditBtn
              commentId={id}
              setIdOfUpdatingComment={setIdOfUpdatingComment}
              setIsShowingTextInput={setIsShowingTextInput}
              idOfUpdatingComment={idOfUpdatingComment}
            />
          )}
          {isYouAuthor && <CommentDeleteBtn commentId={id} activityId={activityId} />}
        </View>
      </View>
      <Divider />
    </>
  );
}

const styles = StyleSheet.create({
  commentWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    paddingTop: 5,
    paddingLeft: 10,
    paddingBottom: 5,
  },
  textCommentWrapper: {
    marginLeft: 10,
  },
  likesWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateTimeWrapper: {
    display: 'flex',
    flexDirection: 'row',
  },
  floatingBtn: {
    position: 'absolute',
    margin: 16,
    right: 0,
    top: -60,
  },
});
