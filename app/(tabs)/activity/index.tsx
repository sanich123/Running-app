import { useEffect, useState } from 'react';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import ActivityComponent from '../../../components/activity-component/activity-component';
import { getExactPosition } from '../../../utils/get-initial-position';
import useStartStopTracking from '../../../utils/hooks/use-start-stop-tracking';

export default function Activity() {
  const { activityStatus } = useStartStopTracking();
  const { initialLocation } = useSelector(({ location }) => location);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!initialLocation.coords) {
      console.log('Этот код выполняется');
      getExactPosition({ setIsLoading, setIsError, setIsSuccess });
    }
  }, [initialLocation, activityStatus]);

  return (
    <>
      {isLoading ? (
        <Text
          variant="bodyLarge"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: 0,
            backgroundColor: 'yellow',
            width: '100%',
            height: 30,
          }}>
          Загружаем данные о местоположении...
        </Text>
      ) : null}
      {isError ? <Text variant="bodyLarge">An error occured</Text> : null}
      {isSuccess ? (
        <Text
          variant="bodyLarge"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: 0,
            backgroundColor: 'green',
            width: '100%',
            height: 30,
          }}>
          Получили данные о местоположении!
        </Text>
      ) : null}
      <ActivityComponent />
    </>
  );
}
