import ErrorComponent from '@C/error-component/error-component';
import { useGetCommentsByActivityIdQuery } from '@R/runich-api/runich-api';
import { CommentResponse } from '@R/runich-api/types';
import { useAppSelector } from '@R/typed-hooks';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, AnimatedFAB, Text, Button } from 'react-native-paper';

import Comment from '../comment/comment';
import CommentInput from '../comment-input/comment-input';

export default function Comments({ activityId, commentsLength }: { activityId: string; commentsLength: number }) {
  const [isShowingTextInput, setIsShowingTextInput] = useState(false);
  const [idOfUpdatingComment, setIdOfUpdatingComment] = useState('');
  const [isNeedToGetUpdatedComments, setIsNeedToGetUpdatedComments] = useState(true);
  const { activityIdWhichCommentsToUpdate } = useAppSelector(({ mainFeed }) => mainFeed);
  const [take, increaseTakeNumber] = useState(10);
  const {
    isLoading,
    error,
    data: updatedComments,
    refetch,
  } = useGetCommentsByActivityIdQuery({ activityId, page: 0, take }, { skip: !isNeedToGetUpdatedComments });

  useEffect(() => {
    if (activityIdWhichCommentsToUpdate === activityId) {
      setIsNeedToGetUpdatedComments(true);
    }
  }, [activityIdWhichCommentsToUpdate, activityId]);

  return (
    <View style={(isLoading || error || !!updatedComments?.message) && styles.isInCenter}>
      {isLoading && <ActivityIndicator testID="commentsActivityIndicator" />}
      {error || updatedComments?.message ? <ErrorComponent error={error || updatedComments} refetch={refetch} /> : null}
      {updatedComments ? (
        <FlatList
          data={updatedComments
            ?.slice()
            ?.sort((a: CommentResponse, b: CommentResponse) => Date.parse(a.date) - Date.parse(b.date))}
          renderItem={({ item: { authorId, comment, id, date, profile } }) => (
            <Comment
              authorId={authorId}
              comment={comment}
              key={id}
              id={id}
              date={date}
              profile={profile}
              activityId={activityId}
              idOfUpdatingComment={idOfUpdatingComment}
              setIdOfUpdatingComment={setIdOfUpdatingComment}
              setIsShowingTextInput={setIsShowingTextInput}
            />
          )}
          ListEmptyComponent={
            <View
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingLeft: 15,
                paddingRight: 15,
              }}>
              <Text variant="bodyLarge">
                К этой активности еще никто не оставил комментарий. Будь первым, как Гагарин!
              </Text>
            </View>
          }
          ListHeaderComponent={() =>
            commentsLength > updatedComments?.length && (
              <Button
                icon="reload"
                onPress={() => increaseTakeNumber(take + 10)}
                mode="outlined"
                style={{ borderRadius: 0, marginLeft: 5, marginRight: 5 }}
                loading={isLoading}
                disabled={isLoading}>
                <Text variant="bodyMedium">Загрузить еще 10 комментов</Text>
              </Button>
            )
          }
          initialNumToRender={8}
          maxToRenderPerBatch={15}
        />
      ) : null}

      {!idOfUpdatingComment && (
        <>
          {isShowingTextInput ? (
            <CommentInput
              activityId={`${activityId}`}
              setIsShowingTextInput={setIsShowingTextInput}
              commentId=""
              setIdOfUpdatingComment={setIdOfUpdatingComment}
            />
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
        </>
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
