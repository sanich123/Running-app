import AvatarShowable from '@c/avatar/avatar-showable';
import CommentLikeBtn from '@c/comment-like-btn/comment-like-btn';
import CommentLikesLength from '@c/comment-likes-length/comment-likes-length';
import ErrorComponent from '@c/error-component/error-component';
import UserNameSurname from '@c/user-name-surname/user-name-surname';
import { useGetCommentsByActivityIdQuery } from '@r/runnich-api/runnich-api';
import { formatDate, getHoursMinutes } from '@u/time-formatter';
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';

export default function Comments({ id }: { id: string }) {
  const { isLoading, error, data: comments } = useGetCommentsByActivityIdQuery(id);
  return (
    <>
      {isLoading && <ActivityIndicator />}
      {error ? <ErrorComponent error={error} /> : null}
      {comments?.map(({ authorId, comment, id, date }) => (
        <Fragment key={id}>
          <View style={styles.commentWrapper}>
            <AvatarShowable size={25} id={authorId} />
            <View style={{ display: 'flex' }}>
              <UserNameSurname userId={authorId} size="bodyMedium" />
              <Text variant="bodySmall">{formatDate(date)}</Text>
              <Text variant="bodySmall">{getHoursMinutes(date)}</Text>
            </View>
          </View>
          <View style={styles.textCommentWrapper}>
            <Text variant="bodyLarge">{comment}</Text>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              columnGap: 15,
            }}>
            <CommentLikeBtn commentId={id} />
            <CommentLikesLength id={id} />
          </View>
          <Divider />
        </Fragment>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  commentWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    paddingTop: 5,
    paddingLeft: 10,
    paddingBottom: 5,
  },
  textCommentWrapper: { paddingTop: 5, paddingLeft: 10, paddingBottom: 10 },
});
