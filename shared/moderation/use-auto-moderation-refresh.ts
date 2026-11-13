import { useEffect, useRef } from 'react';

const AUTO_REFRESH_INTERVAL_MS = 8_000;
const AUTO_REFRESH_LIMIT = 5;

export default function useAutoModerationRefresh(isPending: boolean, onRefresh: () => void) {
  const onRefreshRef = useRef(onRefresh);
  const refreshCount = useRef(0);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (!isPending) {
      refreshCount.current = 0;
      return;
    }

    const interval = setInterval(() => {
      refreshCount.current += 1;
      onRefreshRef.current();
      if (refreshCount.current >= AUTO_REFRESH_LIMIT) clearInterval(interval);
    }, AUTO_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isPending]);
}
