import { useAppSelector } from '@R/typed-hooks';
import EmptyState from '@S/empty-state/empty-state';
import { EMPTY_ACTIVITIES_LIST } from './const';

export default function EmptyActivitiesList() {
  const { language } = useAppSelector(({ language }) => language);
  return <EmptyState icon="run-fast" title={EMPTY_ACTIVITIES_LIST[language].emptyActivities} />;
}
