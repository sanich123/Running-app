import { useAuth } from '@A/context/auth-context';
import { CustomImage } from '@C/custom-image/custom-image';
import { CommentResponse } from '@R/runich-api/types';
import { useAppSelector } from '@R/typed-hooks';
import { formatDate, getHoursMinutes } from '@U/time-formatter';
import { ROUTES } from '@const/enums';
import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { TouchableRipple, useTheme, Text, Divider, IconButton, MD3Colors } from 'react-native-paper';

import CommentDeleteBtn from '../comment-delete-btn/comment-delete-btn';
import CommentInput from '../comment-input/comment-input';
import CommentLikeBtn from '../comment-like-btn/comment-like-btn';
import CommentLikesLength from '../comment-likes-length/comment-likes-length';

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
}: CommentResponse & {
  activityId: string;
  idOfUpdatingComment: string;
  setIdOfUpdatingComment: (arg: string) => void;
  setIsShowingTextInput: (arg: boolean) => void;
}) {
  const { user } = useAuth();
  const { dark } = useTheme();
  const { push } = useRouter();
  const { language } = useAppSelector(({ language }) => language);

  const isYouAuthor = user?.id === authorId;
  return (
    <>
      <TouchableRipple
        rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
        borderless
        onPress={() => push(`/${ROUTES.home}/${ROUTES.profile}/${authorId}`)}>
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
      </TouchableRipple>
      <View style={styles.textCommentWrapper}>
        {idOfUpdatingComment === id ? (
          <CommentInput
            activityId={activityId}
            setIsShowingTextInput={setIsShowingTextInput}
            commentToUpdate={comment}
            commentId={id}
            setIdOfUpdatingComment={setIdOfUpdatingComment}
          />
        ) : (
          <Text variant="bodyLarge">{comment}</Text>
        )}
      </View>
      <View style={styles.likesWrapper}>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <CommentLikeBtn commentId={id} />
          <CommentLikesLength id={id} />
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          {isYouAuthor && (
            <IconButton
              icon={idOfUpdatingComment === id ? 'pencil-off' : 'pencil'}
              size={20}
              iconColor={MD3Colors.primary50}
              onPress={() => {
                setIsShowingTextInput(true);
                if (id !== idOfUpdatingComment) {
                  setIdOfUpdatingComment(id);
                } else {
                  setIdOfUpdatingComment('');
                  setIsShowingTextInput(false);
                }
              }}
              style={{ marginRight: -10 }}
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
    display: 'flex',
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
