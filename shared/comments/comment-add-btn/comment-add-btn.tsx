import { StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { setIdOfUpdatingComment } from '@R/slices/comment/comment';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';

export default function CommentAddBtn() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  return (
    <Button
      testID="floatingBtn"
      accessibilityLabel={language === LANGUAGES.russian ? 'Добавить комментарий' : 'Add a comment'}
      contentStyle={styles.content}
      icon="comment-plus-outline"
      mode="contained-tonal"
      style={[styles.button, { backgroundColor: colors.secondaryContainer }]}
      textColor={colors.onSecondaryContainer}
      onPress={() => {
        dispatch(setIdOfUpdatingComment(''));
      }}>
      {language === LANGUAGES.russian ? 'Добавить комментарий' : 'Add a comment'}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'stretch',
    borderRadius: 14,
    marginHorizontal: 10,
    marginVertical: 8,
  },
  content: {
    minHeight: 48,
  },
});
