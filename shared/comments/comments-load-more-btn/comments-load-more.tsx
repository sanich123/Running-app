import { Button } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import type { CommentsLoadMoreButtonProps } from '../types';

export default function CommentsLoadMoreBtn({ onPress, isLoading, isError }: CommentsLoadMoreButtonProps) {
  const { language } = useAppSelector(({ settings }) => settings);
  return (
    <Button
      testID="comments-load-more"
      icon={isError ? 'reload' : 'chevron-up'}
      loading={isLoading}
      disabled={isLoading}
      onPress={onPress}
      mode="outlined"
      style={{ borderRadius: 10, marginLeft: 10, marginRight: 10, marginBottom: 5 }}>
      {isError
        ? language === LANGUAGES.russian
          ? 'Повторить загрузку'
          : 'Retry loading'
        : language === LANGUAGES.russian
          ? 'Загрузить предыдущие комментарии'
          : 'Load previous comments'}
    </Button>
  );
}
