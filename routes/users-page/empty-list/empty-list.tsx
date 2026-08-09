import { useAppSelector } from '@R/typed-hooks';
import { EMPTY_STATE_COPY } from '@S/empty-state/const';
import EmptyState from '@S/empty-state/empty-state';
import { EMPTY_USERS_LIST } from './const';

export default function EmptyUsersList({ isInitial }: { isInitial: boolean }) {
  const { language } = useAppSelector(({ language }) => language);
  const message = EMPTY_USERS_LIST[language];

  return (
    <>
      {!isInitial && (
        <EmptyState icon="account-search-outline" title={message} message={EMPTY_STATE_COPY[language].users.message} />
      )}
    </>
  );
}
