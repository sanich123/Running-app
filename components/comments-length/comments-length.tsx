import { CommentType } from '@C/card/const ';
import { useAppSelector } from '@R/typed-hooks';
import { ROUTES } from '@const/enums';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { COMMENTS_LENGTH_TEST_ID, getWordEnding } from './const';

export default memo(function CommentsLength({ activityId, comments }: { activityId: string; comments: CommentType[] }) {
  const { language } = useAppSelector(({ language }) => language);
  const { push } = useRouter();

  return (
    <Pressable
      testID={COMMENTS_LENGTH_TEST_ID}
      style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }, styles.isInCenter]}
      onPress={() => push(`/${ROUTES.home}/${ROUTES.comment}/${activityId}`)}>
      <Text variant="bodyMedium">
        {comments?.length > 0 && `${comments?.length} ${getWordEnding(comments?.length, language)}`}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  isInCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    marginRight: 15,
  },
});
