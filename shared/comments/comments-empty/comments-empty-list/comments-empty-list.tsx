import { useAppSelector } from '@R/typed-hooks';
import { EMPTY_STATE_COPY } from '@S/empty-state/const';
import EmptyState from '@S/empty-state/empty-state';

export default function CommentsEmptyList() {
  const { language } = useAppSelector(({ settings }) => settings);
  return (
    <EmptyState
      icon="comment-text-outline"
      title={EMPTY_STATE_COPY[language].comments.title}
      message={EMPTY_STATE_COPY[language].comments.message}
    />
  );
}
