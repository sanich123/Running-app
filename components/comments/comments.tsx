import CommentLikeBtn from '@C/comment-like-btn/comment-like-btn';
import CommentLikesLength from '@C/comment-likes-length/comment-likes-length';
import { CustomImage } from '@C/custom-image/custom-image';
import ErrorComponent from '@C/error-component/error-component';
import { useGetCommentsByActivityIdQuery } from '@R/runich-api/runich-api';
import { CommentResponse } from '@R/runich-api/types';
import { useAppSelector } from '@R/typed-hooks';
import { formatDate, getHoursMinutes } from '@U/time-formatter';
import { ROUTES } from '@const/enums';
import { useRouter } from 'expo-router';
import { Fragment } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';

export default function Comments({ id }: { id: string }) {
  const { isLoading, error, data: comments } = useGetCommentsByActivityIdQuery(id);
  const { push } = useRouter();
  const { language } = useAppSelector(({ language }) => language);

  return (
    <View style={(isLoading || error) && styles.isInCenter}>
      {isLoading && <ActivityIndicator testID="commentsActivityIndicator" />}
      {error ? <ErrorComponent error={error} /> : null}
      {!error &&
        comments?.length > 0 &&
        comments?.map(({ authorId, comment, id, date, profile }: CommentResponse) => (
          <Fragment key={id}>
            <Pressable
              onPress={() => push(`/${ROUTES.home}/${ROUTES.profile}/${authorId}`)}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
              <View style={styles.commentWrapper}>
                <CustomImage
                  style={{ width: 28, height: 28, borderRadius: 70 }}
                  source={{ uri: profile?.profilePhoto }}
                  contentFit="cover"
                />
                <View style={{ display: 'flex' }}>
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                      {profile?.name}
                    </Text>
                    <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                      {profile?.surname}
                    </Text>
                  </View>
                  <View style={styles.dateTimeWrapper}>
                    <Text variant="bodySmall">{formatDate(date, language)} </Text>
                    <Text variant="bodySmall">{getHoursMinutes(date, language)}</Text>
                  </View>
                </View>
              </View>
            </Pressable>
            <View style={styles.textCommentWrapper}>
              <Text variant="bodyLarge">{comment}</Text>
            </View>
            <View style={styles.likesWrapper}>
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
  isInCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  likesWrapper: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 15,
  },
  dateTimeWrapper: {
    display: 'flex',
    flexDirection: 'row',
  },
});
