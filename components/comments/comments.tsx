import { useRouter } from 'expo-router';
import { Fragment } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { useGetCommentsByActivityIdQuery } from '../../redux/runich-api/runich-api';
import { formatDate, getHoursMinutes } from '../../utils/time-formatter';
import AvatarShowable from '../avatar-showable/avatar-showable';
import CommentLikeBtn from '../comment-like-btn/comment-like-btn';
import CommentLikesLength from '../comment-likes-length/comment-likes-length';
import ErrorComponent from '../error-component/error-component';
import UserNameSurname from '../user-name-surname/user-name-surname';

export default function Comments({ id }: { id: string }) {
  const { isLoading, error, data: comments } = useGetCommentsByActivityIdQuery(id);
  const { push } = useRouter();
  const { language } = useSelector(({ language }) => language);

  return (
    <View style={(isLoading || error) && styles.isInCenter}>
      {isLoading && <ActivityIndicator testID="commentsActivityIndicator" />}
      {error ? <ErrorComponent error={error} /> : null}
      {!error &&
        comments?.map(({ authorId, comment, id, date }) => (
          <Fragment key={id}>
            <Pressable onPress={() => push(`/home/profile/${authorId}`)}>
              <View style={styles.commentWrapper}>
                <AvatarShowable size={28} id={authorId} />
                <View style={{ display: 'flex' }}>
                  <UserNameSurname userId={authorId} size="bodyMedium" />
                  <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <Text variant="bodySmall">{formatDate(date, language)} </Text>
                    <Text variant="bodySmall">{getHoursMinutes(date, language)}</Text>
                  </View>
                </View>
              </View>
            </Pressable>
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
    </View>
  );
}

const styles = StyleSheet.create({
  isInCenter: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
  commentWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    paddingTop: 5,
    paddingLeft: 10,
    paddingBottom: 5,
  },
  textCommentWrapper: {
    paddingTop: 5,
    paddingLeft: 10,
    paddingBottom: 10,
  },
});
