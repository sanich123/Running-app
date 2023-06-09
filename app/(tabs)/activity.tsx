import { StyleSheet } from "react-native";
import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import "expo-dev-client";

import { PointAnnotation, Callout, MapView, Camera, UserLocation, ShapeSource, LineLayer } from "@rnmapbox/maps";
import { useAppSelector } from "../../redux/hooks/hooks";
import useFakeLocations from "../../hooks/use-fake-locations";

export default function Activity() {
  const {
    initialLocation: {
      coords: { latitude, longitude },
    },
  } = useAppSelector(({ location }) => location);
  const { locations, cameraRef } = useFakeLocations();

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <MapView style={styles.map}>
          <UserLocation androidRenderMode="compass" animated />
          <Camera ref={cameraRef} centerCoordinate={[latitude, longitude]} animationMode="flyTo" animationDuration={2000} zoomLevel={12} />
          {locations.map((location) => (
            <PointAnnotation key={Math.random().toString()} coordinate={location} id="home">
              <View style={styles.customHome}></View>
              <Callout title={`Координаты ${location[0]}, ${location[1]}`} />
            </PointAnnotation>
          ))}
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
    height: "100%",
    width: "100%",
  },

  map: {
    flex: 1,
  },
  customHome: {
    height: 20,
    width: 20,
    backgroundColor: "green",
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 50,
  },
});
