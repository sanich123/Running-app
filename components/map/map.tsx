import { StyleSheet } from "react-native";
import { Text, View } from "../../components/Themed";
import "expo-dev-client";
import { PointAnnotation, Callout, MapView, Camera, UserLocation, ShapeSource, LineLayer } from "@rnmapbox/maps";
import { useAppSelector } from "../../redux/hooks/hooks";
import useFakeLocations from "../../hooks/use-fake-locations";
import { useEffect, useRef, useState } from "react";
import { MOCK_LOCATIONS } from "../../constants/mocks/mocks";

export default function Map() {
  const {
    initialLocation: {
      coords: { latitude, longitude },
    },
  } = useAppSelector(({ location }) => location);
    const [duration, setDuration] = useState(0);
    const [start, setStart] = useState(false);
    const [locations, setLocations] = useState([MOCK_LOCATIONS[0]]);
    const camera = useRef<Camera>(null);
    let interval: string | number | NodeJS.Timeout | undefined;

    useEffect(() => {
      if (start) {
        interval = setInterval(() => setDuration((duration) => duration + 1), 1000);
        return () => clearInterval(interval);
      }
      if (!start) {
        clearInterval(interval);
        setDuration(0);
        setLocations([MOCK_LOCATIONS[0]]);
      }
    }, [start]);

    useEffect(() => {
      if (duration < MOCK_LOCATIONS.length) {
        setLocations([...locations, MOCK_LOCATIONS[duration]]);
      }
    }, [duration]);

    useEffect(() => {
      camera.current?.setCamera({
        centerCoordinate: locations[locations.length - 1],
      });
    }, [locations]);
  const { map, customHome } = styles;
  console.log(locations);
  return (
    <MapView style={map}>
      <UserLocation androidRenderMode="compass" animated />
      <Camera ref={camera} centerCoordinate={[latitude, longitude]} animationMode="flyTo" animationDuration={2000} zoomLevel={14} />
      <PointAnnotation key={Math.random().toString()} coordinate={locations[locations.length - 1]} id="home">
        <View style={customHome}>
          <Text>Кастомная иконка</Text>
        </View>
        <Callout title={`Координаты ${locations[locations.length - 1]}, ${locations[locations.length - 1]}`} />
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
