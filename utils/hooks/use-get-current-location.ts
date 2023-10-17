import { useEffect, useState } from 'react';

import { getExactPosition } from '../get-initial-position';

export default function useGetCurrentLocation() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    getExactPosition({ setIsLoading, setIsError, setIsSuccess });
  }, []);

  return { isLoading, isError, isSuccess };
}
