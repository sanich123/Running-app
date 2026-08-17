import { Button, Text } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import type { CommentsLoadMoreButtonProps } from '../types';

export default function CommentsLoadMoreBtn({ take, increaseTakeNumber, commentsLength }: CommentsLoadMoreButtonProps) {
  const { language } = useAppSelector(({ settings }) => settings);
  const diffBetweenAllCommentsAndDownloaded = commentsLength - take >= 10 ? 10 : commentsLength - take;
  return (
    <Button
      testID="comments-load-more"
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
