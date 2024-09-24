import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { Button, Text } from 'react-native-paper';

export default function CommentsLoadMoreBtn({
  take,
  increaseTakeNumber,
  commentsLength,
}: {
  take: number;
  increaseTakeNumber: (arg: number) => void;
  commentsLength: number;
}) {
  const { language } = useAppSelector(({ language }) => language);
  const diffBetweenAllCommentsAndDownloaded = commentsLength - take;
  return (
    <Button
      icon="reload"
      onPress={() => increaseTakeNumber(take + 10)}
      mode="outlined"
      style={{ borderRadius: 0, marginLeft: 5, marginRight: 5 }}>
      <Text variant="bodyMedium">
        {language === LANGUAGES.russian
          ? `Загрузить еще ${diffBetweenAllCommentsAndDownloaded >= 10 ? 10 : diffBetweenAllCommentsAndDownloaded} комментов`
          : `Load ${diffBetweenAllCommentsAndDownloaded >= 10 ? 10 : diffBetweenAllCommentsAndDownloaded} more comments`}
      </Text>
    </Button>
  );
}
