import { StyleSheet } from "react-native";
import { View } from "../../components/Themed";
import { MapView, Camera, UserLocation } from "@rnmapbox/maps";
import StartSection from "../../components/start-section/start-section";
import { useAppSelector } from "../../redux/hooks/hooks";
import useFakeLocations from "../../hooks/use-fake-locations";
import RouteLine from "../../components/route-line/route-line";
import NavIcon from "../../components/nav-icon/nav-icon";

export default function Activity() {
  const {
    initialLocation: {
      coords: { latitude, longitude },
    },
  } = useAppSelector(({ location }) => location);
  const { setStatus, status, locations, duration, cameraRef, lastView, distance } = useFakeLocations();
  const { page, container, monitor, map } = styles;
  console.log(distance);
  return (
    <View style={page}>
      <View style={container}>
        <MapView style={map}>
          <UserLocation androidRenderMode="compass" animated />
          <Camera ref={cameraRef} centerCoordinate={[longitude, latitude]} animationMode="flyTo" animationDuration={1000} zoomLevel={11} />
          <NavIcon lastView={lastView} />
          {locations.length > 1 && <RouteLine locations={locations} />}
        </MapView>
      </View>
      <View style={monitor}>
        <StartSection distance={distance} velocity={5.5} duration={duration} status={status} setStatus={setStatus} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    height: "60%",
    width: "100%",
  },
  monitor: {
    height: "40%",
    width: "100%",
  },
  map: {
    flex: 1,
  },
});
