import { StyleSheet } from "react-native";
import { Text, View } from "../../components/Themed";
import { PointAnnotation, Callout, MapView, Camera, UserLocation, ShapeSource, LineLayer } from "@rnmapbox/maps";
import StartSection from "../../components/start-section/start-section";
import { useAppSelector } from "../../redux/hooks/hooks";
import useFakeLocations from "../../hooks/use-fake-locations";

export default function Activity() {
  const {
    initialLocation: {
      coords: { latitude, longitude },
    },
  } = useAppSelector(({ location }) => location);
  const { setStatus, status, locations, duration, cameraRef } = useFakeLocations();
  const { page, container, monitor, map, customHome } = styles;

  return (
    <View style={page}>
      <View style={container}>
        <MapView style={map}>
          <UserLocation androidRenderMode="compass" animated />
          <Camera ref={cameraRef} centerCoordinate={[latitude, longitude]} animationMode="flyTo" animationDuration={2000} zoomLevel={11} />
          <PointAnnotation key={Math.random().toString()} coordinate={locations[locations.length - 1]} id="home">
            <View style={customHome}>
              <Text>Кастомная иконка</Text>
            </View>
            <Callout title={`Координаты ${locations[locations.length - 1]}, ${locations[locations.length - 1]}`} />
          </PointAnnotation>
          {locations.length > 1 && (
            <ShapeSource
              id="shape-source"
              shape={{
                type: "FeatureCollection",
                features: [
                  {
                    type: "Feature",
                    properties: {},
                    geometry: {
                      type: "LineString",
                      coordinates: locations,
                    },
                  },
                ],
              }}
            >
              <LineLayer id="line-layer" style={{ lineColor: "orange", lineWidth: 5 }} />
            </ShapeSource>
          )}
        </MapView>
      </View>
      <View style={monitor}>
        <StartSection distance={11} velocity={5.5} duration={duration} status={status} setStatus={setStatus} />
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
  customHome: {
    height: 80,
    width: 80,
    backgroundColor: "green",
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 50,
  },
});
