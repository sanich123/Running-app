import { View } from 'react-native';

import { CustomImage } from '@C/custom-image/custom-image';
import Metrics from '../metrics/metrics';
import { ActivityCardProps } from '../types';
import { MutableRefObject } from 'react';

export default function ShareActivityImage({
  distance,
  duration,
  title,
  isShowDescription,
  description,
  userId,
  id,
  mapPhotoUrl,
  cardRef,
}: Pick<
  ActivityCardProps,
  'distance' | 'duration' | 'title' | 'isShowDescription' | 'description' | 'userId' | 'id' | 'mapPhotoUrl'
> & { cardRef: MutableRefObject<View | null> }) {
  return (
    <View style={{ zIndex: 0, position: 'absolute' }} ref={cardRef} collapsable={false}>
      <View style={{ position: 'absolute', bottom: 0, zIndex: 1 }}>
        <Metrics
          distance={distance}
          duration={duration}
          title={title}
          isShowDescription={isShowDescription}
          description={description}
          userId={userId}
          id={id}
        />
      </View>
      <View style={{ position: 'relative', zIndex: 0 }}>
        <CustomImage
          style={{ width: 350, height: 200 }}
          source={{ uri: `${mapPhotoUrl}` }}
          contentFit="cover"
          testID={mapPhotoUrl}
        />
      </View>
    </View>
  );
}
