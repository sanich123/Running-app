import { StyleSheet } from "react-native";
import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import "expo-dev-client";
import React, { useState } from "react";

import Mapbox, { PointAnnotation, Callout, MapView, Camera, UserLocation, MarkerView } from "@rnmapbox/maps";
import { useAppSelector } from "../../redux/hooks/hooks";

export default function Activity() {
  const {
    initialLocation: {
      coords: { latitude, longitude },
    },
  } = useAppSelector(({ location }) => location);

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <MapView style={styles.map}>
          <Camera zoomLevel={15} centerCoordinate={[longitude, latitude]} animationMode="flyTo" animationDuration={2000} followUserLocation />
          <MarkerView coordinate={[longitude, latitude]} />
          <PointAnnotation coordinate={[longitude, latitude]} id="home">
            <View
              style={styles.customHome}
            ></View>
            <Callout title="Че тыкаешь?"/>
          </PointAnnotation>
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
