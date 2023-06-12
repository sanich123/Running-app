import { StyleSheet } from 'react-native';
import { View } from '../../components/Themed';
import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import { useAppSelector } from '../../redux/hooks/hooks';
import useFakeLocations from '../../hooks/use-fake-locations';
import RouteLine from '../../components/route-line/route-line';
import NavIcon from '../../components/nav-icon/nav-icon';
import Metrics from '../../components/metrics/metrics';
import StartStopPauseBtns from '../../components/start-stop-pause-btns/start-stop-pause-btns';
import { STATUSES } from '../../constants/enums';

export default function Activity() {
  const {
    initialLocation: {
      coords: { latitude, longitude },
    },
  } = useAppSelector(({ location }) => location);
  const { setStatus, status, locations, duration, cameraRef, lastView, distance } = useFakeLocations();
  const { page, container, monitor, map } = styles;

  return (
    <View style={page}>
      <View style={container}>
        {status === STATUSES.started && <Metrics velocity={11} distance={distance} duration={duration} />}
        {(status === STATUSES.initial || status === STATUSES.paused) && (
          <MapView style={map}>
            <UserLocation androidRenderMode="compass" animated />
            <Camera ref={cameraRef} centerCoordinate={[longitude, latitude]} animationMode="flyTo" animationDuration={1000} zoomLevel={11} />
            <NavIcon lastView={lastView} />
            {locations.length > 1 && <RouteLine locations={locations} />}
          </MapView>
        )}
      </View>
      <View style={monitor}>
        <StartStopPauseBtns status={status} setStatus={setStatus} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    height: '80%',
    width: '100%',
  },
  monitor: {
    height: '20%',
    width: '100%',
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
