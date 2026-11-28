import { useGetGroupsQuery } from '@R/services/groups/groups';
import { useAppSelector } from '@R/typed-hooks';
import useFocusedAppPolling from '@U/hooks/use-focused-app-polling';
import { GROUPS_COPY } from '../../const';
import type { GroupsQuery } from '@R/services/groups/types';

export default function useGroupsList(filters: GroupsQuery) {
  const { scope, search, sport } = filters;
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = GROUPS_COPY[language];
  const { data: groups = [], isLoading, isFetching, isError, error, refetch } = useGetGroupsQuery(filters);
  const visibleGroups =
    scope === 'mine'
      ? groups.filter(
          ({ currentMembership, isOwner, privacy }) =>
            isOwner || currentMembership?.status === 'active' || (privacy === 'open' && currentMembership === null),
        )
      : groups;

  useFocusedAppPolling(
    groups.some(({ photoPending }) => photoPending),
    8000,
    () => void refetch(),
  );

  return {
    copy,
    error,
    hasFilter: Boolean(search || sport),
    isError,
    isFetching,
    isLoading,
    refetch,
    visibleGroups,
  };
}
