import { runichApi } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { useEffect } from 'react';

export default function usePrefetchSmthng(name: any) {
  const { isNeedToPrefetchActivities } = useAppSelector(({ profile }) => profile);
  const prefetchUsers = runichApi.usePrefetch(name);

  useEffect(() => {
    if (isNeedToPrefetchActivities && !process.env.IS_TESTING) {
      prefetchUsers('');
    }
  }, [isNeedToPrefetchActivities, prefetchUsers]);
}
