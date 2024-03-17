import { useAppSelector } from '@R/typed-hooks';
import { View } from 'react-native';

import { MAP_METRICS } from './const';
import { getSpeedInMinsInKm } from '../../utils/location-utils';
import { formatDuration, formatDurationMinsSecs } from '../../utils/time-formatter';
import ActivityErrorMsg from '../activity-error-msg/activity-error-msg';
import MetricsItem from '../metrics-item/metrics-item';

export default function Metrics() {
  const { kilometresSplit, altitude, duration, distance, isMapVisible } = useAppSelector(({ location }) => location);
  const { language } = useAppSelector(({ language }) => language);
  const formattedDuration = formatDuration(duration);
  const formattedDistance = (distance / 1000).toFixed(2);
  const lastKmPace = kilometresSplit?.length > 0 ? kilometresSplit[kilometresSplit.length - 1] : 0;

  return (
    <>
      <ActivityErrorMsg />
      <View
        className={`flex flex-row flex-wrap justify-between relative ${isMapVisible ? 'h-20' : 'h-full'} bg-neutral-500`}>
        <MetricsItem
          isMapVisible={isMapVisible}
          title={`${MAP_METRICS[language].time}:`}
          metric={formattedDuration}
          isCentral={false}
        />
        {!isMapVisible && (
          <MetricsItem
            isMapVisible={isMapVisible}
            title={`${MAP_METRICS[language].altitude}:`}
            metric={`${altitude.toFixed(2)} ${`${MAP_METRICS[language].m}`}`}
            isCentral={false}
          />
        )}
        <MetricsItem
          isMapVisible={isMapVisible}
          title={`${MAP_METRICS[language].pace}:`}
          metric={`${
            duration && distance ? getSpeedInMinsInKm(distance, duration).paceAsString : 0
          } /${`${MAP_METRICS[language].km}`}`}
          isCentral
        />
        {!isMapVisible && (
          <MetricsItem
            isMapVisible={isMapVisible}
            title={`${MAP_METRICS[language].lastKm}:`}
            metric={formatDurationMinsSecs(lastKmPace ? lastKmPace.lastKilometerDuration : 0)}
            isCentral={false}
          />
        )}
        <MetricsItem
          isMapVisible={isMapVisible}
          title={`${MAP_METRICS[language].distance}:`}
          metric={`${formattedDistance} ${`${MAP_METRICS[language].km}`}`}
          isCentral={false}
        />
      </View>
    </>
  );
}
