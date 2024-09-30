import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { CustomImage } from '@C/custom-image/custom-image';
import { ActivityCardProps } from '../types';
import { MutableRefObject } from 'react';
import { Text } from 'react-native-paper';
import { formatDuration } from '@U/time-formatter';
import { CARD_METRICS } from '../metrics/const';
import { useAppSelector } from '@R/typed-hooks';
import { getSpeedInMinsInKm } from '@U/location/location-utils';

export default function ShareActivityImage({
  distance,
  duration,
  title,
  isShowDescription,
  description,
  mapPhotoUrl,
  cardRef,
}: Pick<ActivityCardProps, 'distance' | 'duration' | 'title' | 'isShowDescription' | 'description' | 'mapPhotoUrl'> & {
  cardRef: MutableRefObject<View | null>;
}) {
  const { language } = useAppSelector(({ language }) => language);
  const { height, width } = useWindowDimensions();
  return (
    <View style={{ zIndex: -9999, position: 'absolute', bottom: -height }} ref={cardRef} collapsable={false}>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          padding: 5,
          backgroundColor: `rgba(0, 0, 0, 0.2)`,
          width: '100%',
        }}>
        {title ? (
          <Text variant="titleLarge" style={styles.title}>
            {title}
          </Text>
        ) : null}
        <View style={styles.metricsWrapper}>
          <View>
            <Text variant="bodySmall" style={styles.title}>{`${CARD_METRICS[language].time}: `}</Text>
            <Text variant="titleLarge" style={styles.title}>{`${formatDuration(duration)}`}</Text>
          </View>
          <View>
            <Text variant="bodySmall" style={styles.title}>{`${CARD_METRICS[language].pace}: `}</Text>
            <Text
              variant="titleLarge"
              style={
                styles.title
              }>{`${getSpeedInMinsInKm(distance, duration).paceAsString} /${CARD_METRICS[language].km}`}</Text>
          </View>
          <View>
            <Text variant="bodySmall" style={styles.title}>{`${CARD_METRICS[language].distance}: `}</Text>
            <Text
              variant="titleLarge"
              style={styles.title}>{`${(distance / 1000).toFixed(2)} ${CARD_METRICS[language].km}`}</Text>
          </View>
        </View>
        {isShowDescription ? (
          <Text variant="bodyLarge" style={styles.title}>
            {description}
          </Text>
        ) : null}
      </View>
      <View style={{ position: 'relative', zIndex: -9998 }}>
        <CustomImage
          style={{ width, height: 500 }}
          source={{ uri: `${mapPhotoUrl}` }}
          contentFit="cover"
          testID={mapPhotoUrl}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  metricsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 15,
    marginVertical: 3,
    zIndex: -9997,
  },
  title: {
    fontWeight: 'bold',
    color: 'white',
  },
});
