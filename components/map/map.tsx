import { MapView, Camera, UserLocation, PointAnnotation, Callout } from '@rnmapbox/maps';
import { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

import { ActivityComponentContext } from '../../utils/context/activity-component';
import MapNavIcon from '../map-nav-icon/map-nav-icon';
import MapRouteLine from '../map-route-line/map-route-line';

export default function Map({ isMapVisible }: { isMapVisible: boolean }) {
  const { kilometresSplit } = useSelector(({ location }) => location);
  const { cameraRef, locations, lastView } = useContext(ActivityComponentContext);

  return (
    <MapView style={[{ flex: 1 }, isMapVisible && { height: '60%' }]}>
      <UserLocation
        androidRenderMode="compass"
        animated
        onUpdate={(location) => console.log('userlocation', location)}
      />
      {lastView && lastView.length > 1 ? (
        <Camera
          ref={cameraRef}
          centerCoordinate={lastView}
          animationMode="flyTo"
          animationDuration={1000}
          zoomLevel={18}
        />
      ) : null}

      {kilometresSplit?.length > 0
        ? kilometresSplit?.map(({ kilometerPoint }, index) => {
            const {
              coords: { longitude, latitude },
            } = kilometerPoint;
            return (
              <PointAnnotation
                key={`${index}/${longitude}, ${latitude}`}
                coordinate={[longitude, latitude]}
                id={`${index}/${longitude}, ${latitude}`}>
                <View style={styles.customKm} />
                <Callout title={`${index + 1} kilometer`} />
              </PointAnnotation>
            );
          })
        : null}
      {lastView && lastView.length > 1 ? <MapNavIcon lastView={lastView} /> : null}
      {locations.length > 1 && <MapRouteLine locations={locations} />}
    </MapView>
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
