import { MapView, Camera, UserLocation, PointAnnotation, Callout } from '@rnmapbox/maps';
import { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { ActivityComponentContext } from '../../utils/context/activity-component';
import MapNavIcon from '../map-nav-icon/map-nav-icon';
import MapRouteLine from '../map-route-line/map-route-line';

export default function Map({ isMapVisible }: { isMapVisible: boolean }) {
  const { initialLocation, kilometresSplit } = useSelector(({ location }) => location);
  const { cameraRef, locations, lastView } = useContext(ActivityComponentContext);
  console.log(kilometresSplit);
  return (
    <>
      {initialLocation?.coords ? (
        <MapView style={[{ flex: 1 }, isMapVisible && { height: '60%' }]}>
          <UserLocation androidRenderMode="compass" animated />
          <Camera
            ref={cameraRef}
            centerCoordinate={lastView}
            animationMode="flyTo"
            animationDuration={1000}
            zoomLevel={18}
          />
          {kilometresSplit?.length > 0
            ? kilometresSplit?.map(({ kilometerPoint }, index) => (
                <PointAnnotation
                  key={`${index}/${kilometerPoint.coords.longitude}, ${kilometerPoint.coords.latitude}`}
                  coordinate={[kilometerPoint.coords.longitude, kilometerPoint.coords.latitude]}
                  id={`${index}/${kilometerPoint.coords.longitude}, ${kilometerPoint.coords.latitude}`}>
                  <View style={styles.customKm} />
                  <Callout title={`${index + 1} kilometer`} />
                </PointAnnotation>
              ))
            : null}
          <MapNavIcon lastView={lastView} />
          {locations.length > 1 && <MapRouteLine locations={locations} />}
        </MapView>
      ) : (
        <ActivityIndicator size="large" />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  customKm: {
    height: 20,
    width: 20,
    backgroundColor: 'blue',
    borderColor: 'orange',
    borderWidth: 2,
    borderRadius: 50,
  },
});
