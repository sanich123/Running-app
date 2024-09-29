import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { Button, Text } from 'react-native-paper';
import { CommentsLoadMorBtnProps } from '../types';

export default function CommentsLoadMoreBtn({ take, increaseTakeNumber, commentsLength }: CommentsLoadMorBtnProps) {
  const { language } = useAppSelector(({ language }) => language);
  const diffBetweenAllCommentsAndDownloaded = commentsLength - take >= 10 ? 10 : commentsLength - take;
  return (
    <Button
      icon="reload"
      onPress={() => increaseTakeNumber(take + 10)}
      mode="outlined"
      style={{ borderRadius: 10, marginLeft: 10, marginRight: 10, marginBottom: 5 }}>
      <Text variant="bodyMedium">
        {language === LANGUAGES.russian
          ? `Загрузить еще ${diffBetweenAllCommentsAndDownloaded} комментов`
          : `Load ${diffBetweenAllCommentsAndDownloaded} more comments`}
      </Text>
    </Button>
  );
}
