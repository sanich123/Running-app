import { FontAwesome } from '@expo/vector-icons';
import React, { useContext } from 'react';
import { Pressable } from 'react-native';

import { ActivityComponentContext } from '../../utils/context/activity-component';

export default function ActivityShowMapBtn() {
  const { isMapVisible, setIsMapVisible } = useContext(ActivityComponentContext);
  return (
    <Pressable
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'red',
          borderRadius: 50,
          width: 90,
          height: 90,
        },
        { width: 50, height: 50 },
      ]}
      onPress={() => setIsMapVisible(!isMapVisible)}>
      <FontAwesome name="map-marker" size={25} color="white" />
    </Pressable>
  );
}
