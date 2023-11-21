import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { COMMENTS_ENDING, COMMENTS_LENGTH_TEST_ID, getWordEnding } from './const';
import { useGetCommentsByActivityIdQuery } from '../../redux/runich-api/runich-api';
import { errorExtracter } from '../../utils/error-handler';

export default function CommentsLength({ activityId }: { activityId: string }) {
  const { error, isError, data: comments } = useGetCommentsByActivityIdQuery(activityId);
  const { language } = useSelector(({ language }) => language);
  const { push } = useRouter();

  return (
    <Pressable
      disabled={isError}
      testID={COMMENTS_LENGTH_TEST_ID}
      style={styles.isInCenter}
      onPress={() => push(`/home/comment/${activityId}`)}>
      <Text variant="bodyMedium">
        {isError && `${COMMENTS_ENDING[language].error}: ${errorExtracter(error)}`}
        {!isError && comments?.length > 0 && `${comments?.length} ${getWordEnding(comments?.length, language)}`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  isInCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    marginRight: 15,
  },
});
