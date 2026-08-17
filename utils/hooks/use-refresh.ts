import { useCallback, useState } from 'react';
import { errorToast } from '@S/error-toast/error-toast';

export default function useRefresh(refetch: any) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await refetch().unwrap();
    } catch (error) {
      errorToast('Не удалось обновить данные', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);
  return { refreshing, setRefreshing, onRefresh };
}
