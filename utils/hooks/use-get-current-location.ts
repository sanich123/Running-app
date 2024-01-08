import { useEffect, useState } from 'react';

import { getLastKnownPosition } from '../get-initial-position';

export default function useGetCurrentLocation() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    getLastKnownPosition({ setIsLoading, setIsError, setIsSuccess });
  }, []);

  return { isLoading, isError, isSuccess };
}
