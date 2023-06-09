import { StyleSheet } from "react-native";
import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import "expo-dev-client";
import React, { useState } from "react";

import Mapbox, { PointAnnotation, Callout, MapView, Camera, UserLocation, MarkerView, ShapeSource, LineLayer } from "@rnmapbox/maps";
import { useAppSelector } from "../../redux/hooks/hooks";
import useFakeLocations from "../../hooks/use-fake-locations";

export default function Activity() {
  const {
    initialLocation: {
      coords: { latitude, longitude },
    },
  } = useAppSelector(({ location }) => location);
  const locations = useFakeLocations();

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <MapView style={styles.map}>
          <UserLocation androidRenderMode="compass" animated />
          <Camera centerCoordinate={[longitude, latitude]} animationMode="flyTo" animationDuration={2000} followUserLocation />
          <PointAnnotation coordinate={[longitude, latitude]} id="home">
            <View style={styles.customHome}></View>
            <Callout title="Че тыкаешь?" />
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
                    coordinates: [
                      [31.59757761529764, 46.63755091385189],
                      [27.711524020005644, 46.19689011566155],
                    ],
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
