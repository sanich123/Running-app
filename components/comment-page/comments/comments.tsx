import { CommentType } from '@C/card/const ';
import ErrorComponent from '@C/error-component/error-component';
import { useGetCommentsByActivityIdQuery } from '@R/runich-api/runich-api';
import { CommentResponse } from '@R/runich-api/types';
import { useAppSelector } from '@R/typed-hooks';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, AnimatedFAB } from 'react-native-paper';

import Comment from '../comment/comment';
import CommentInput from '../comment-input/comment-input';

export default function Comments({ activityId, comments }: { activityId: string; comments: CommentType[] }) {
  const [isShowingTextInput, setIsShowingTextInput] = useState(false);
  const [isNeedToGetUpdatedComments, setIsNeedToGetUpdatedComments] = useState(true);
  const { activityIdWhichCommentsToUpdate } = useAppSelector(({ mainFeed }) => mainFeed);
  const {
    isLoading,
    error,
    data: updatedComments,
  } = useGetCommentsByActivityIdQuery(activityId, { skip: !isNeedToGetUpdatedComments });
  const whatCommentsToRender = !isNeedToGetUpdatedComments ? comments : updatedComments;

  useEffect(() => {
    if (activityIdWhichCommentsToUpdate === activityId) {
      setIsNeedToGetUpdatedComments(true);
    }
  }, [activityIdWhichCommentsToUpdate, activityId]);

  return (
    <View style={(isLoading || error) && styles.isInCenter}>
      {isLoading && <ActivityIndicator testID="commentsActivityIndicator" />}
      {error ? <ErrorComponent error={error} /> : null}
      {!error &&
        whatCommentsToRender?.length > 0 &&
        whatCommentsToRender?.map(({ authorId, comment, id, date, profile }: CommentResponse) => (
          <Comment authorId={authorId} comment={comment} key={id} id={id} date={date} profile={profile} />
        ))}
      {isShowingTextInput ? (
        <CommentInput activityId={`${activityId}`} setIsShowingTextInput={setIsShowingTextInput} />
      ) : (
        <AnimatedFAB
          testID="floatingBtn"
          icon="pencil"
          style={styles.floatingBtn}
          onPress={() => setIsShowingTextInput(true)}
          label="Добавить комментарий"
          extended={false}
        />
      )}
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
  floatingBtn: {
    position: 'absolute',
    margin: 16,
    right: 0,
    top: -60,
  },
});
