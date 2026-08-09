import { useEffect, useState } from 'react';
import { getLastKnownPosition } from '../get-initial-position';

export default function useGetCurrentLocation(enabled = true) {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (enabled) {
      getLastKnownPosition({ setIsLoading, setIsError, setIsSuccess });
    }
  }, [enabled]);

  return { isLoading, isError, isSuccess };
}
