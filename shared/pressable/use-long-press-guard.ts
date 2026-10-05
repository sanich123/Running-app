import { useCallback, useMemo, useRef } from 'react';

/** Prevent the tap handler from navigating after a long press; reset for the next gesture. */
export default function useLongPressGuard() {
  const didLongPressRef = useRef(false);

  const resetForGesture = useCallback(() => {
    didLongPressRef.current = false;
  }, []);

  const markLongPress = useCallback(() => {
    didLongPressRef.current = true;
  }, []);

  const shouldHandlePress = useCallback(() => {
    if (!didLongPressRef.current) return true;
    didLongPressRef.current = false;
    return false;
  }, []);

  return useMemo(
    () => ({ resetForGesture, markLongPress, shouldHandlePress }),
    [markLongPress, resetForGesture, shouldHandlePress],
  );
}
