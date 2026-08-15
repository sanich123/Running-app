import type { RefObject } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { UserInfoSize } from '@S/card/user-info/const';
import UserInfo from '@S/card/user-info/user-info';
import CommentDeleteBtn from '../comment-delete-btn/comment-delete-btn';
import CommentEditBtn from '../comment-edit-btn/comment-edit-btn';
import CommentInput from '../comment-input/comment-input';
import CommentLikeBtn from '../comment-like-btn/comment-like-btn';
import CommentLikesLength from '../comment-likes-length/comment-likes-length';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { CommentResponse } from '@R/runich-api/types';

export default function Comment({
  authorId,
  comment,
  id,
  date,
  profile,
  commentLike,
  commentsModalRef,
}: CommentResponse & { commentsModalRef: RefObject<BottomSheetModal | null> }) {
  const { idOfUpdatingComment, commentActivityId } = useAppSelector(({ comment }) => comment);
  const { userId } = useAppSelector(({ auth }) => auth);
  const isYouAuthor = userId === authorId;
  return (
    <>
      <View style={{ padding: 10 }}>
        <UserInfo
          profile={profile}
          date={date}
          userId={authorId}
          size={UserInfoSize.small}
          commentsModalRef={commentsModalRef}
        />
      </View>
      <View style={styles.textCommentWrapper}>
        {idOfUpdatingComment === id ? (
          <CommentInput profile={profile} commentToUpdate={comment} commentId={id} />
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
          {isYouAuthor && <CommentEditBtn commentId={id} idOfUpdatingComment={idOfUpdatingComment} />}
          {isYouAuthor && <CommentDeleteBtn commentId={id} activityId={commentActivityId} />}
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
