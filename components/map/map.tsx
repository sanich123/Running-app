import { StyleSheet } from "react-native";
import { Text, View } from "../../components/Themed";
import "expo-dev-client";
import { PointAnnotation, Callout, MapView, Camera, UserLocation, ShapeSource, LineLayer } from "@rnmapbox/maps";
import { useAppSelector } from "../../redux/hooks/hooks";
import useFakeLocations from "../../hooks/use-fake-locations";

export default function Map() {
  const {
    initialLocation: {
      coords: { latitude, longitude },
    },
  } = useAppSelector(({ location }) => location);
  const { locations, cameraRef, lastView, duration } = useFakeLocations();
  const { map, customHome } = styles;

  return (
    <MapView style={map}>
      <UserLocation androidRenderMode="compass" animated />
      <Camera ref={cameraRef} centerCoordinate={[latitude, longitude]} animationMode="flyTo" animationDuration={2000} zoomLevel={14} />
      <PointAnnotation key={Math.random().toString()} coordinate={lastView} id="home">
        <View style={customHome}>
          <Text>Кастомная иконка</Text>
        </View>
        <Callout title={`Координаты ${lastView[0]}, ${lastView[1]}`} />
      </PointAnnotation>
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
    </MapView>
  );
}

const styles = StyleSheet.create({
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
