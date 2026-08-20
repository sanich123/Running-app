import { StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { setIdOfUpdatingComment, setIsShowingTextInput } from '@R/slices/comment/comment';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { LANGUAGES } from '@const/enums';

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
        dispatch(setIsShowingTextInput(true));
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
