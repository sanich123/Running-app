import { useMemo, useState } from 'react';
import { useAppSelector } from '@R/typed-hooks';
import { GROUPS_COPY } from '../const';
import type { GroupsFilterState } from './types';

export default function useGroupsPage() {
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = GROUPS_COPY[language];
  const [filters, setFilters] = useState<GroupsFilterState>({ scope: 'all', search: '', sport: null });
  const query = useMemo(() => ({ ...filters, sport: filters.sport ?? undefined }), [filters]);

  return { copy, filters, query, setFilters };
}
