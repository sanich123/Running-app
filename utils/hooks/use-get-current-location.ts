import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import useStartStopTracking from './use-start-stop-tracking';
import { STATUSES } from '../../constants/enums';
import { getExactPosition } from '../get-initial-position';

export default function useGetCurrentLocation() {
  const { activityStatus } = useStartStopTracking();
  const { initialLocation } = useSelector(({ location }) => location);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (activityStatus === STATUSES.initial && !initialLocation?.coords) {
      console.log('Этот код выполняется');
      getExactPosition({ setIsLoading, setIsError, setIsSuccess });
    }
  }, [initialLocation, activityStatus]);

  return { isLoading, isError, isSuccess };
}
