import { StyleSheet } from "react-native";
import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import "expo-dev-client";
import React, { useState } from "react";

import Mapbox, { PointAnnotation, Callout, MapView, Camera } from "@rnmapbox/maps";
import { useAppSelector } from "../../redux/hooks/hooks";

Mapbox.setWellKnownTileServer("Mapbox");
Mapbox.setAccessToken("pk.eyJ1Ijoic2FuaWNoMTIzIiwiYSI6ImNsaWFkNmptaDAyaTczcm11NHF0cmp3d2sifQ.ZKH9THateIfnZ7zC23f3-g");

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
          <Camera zoomLevel={15} centerCoordinate={[longitude, latitude]} animationMode="flyTo" animationDuration={2000} />
          <PointAnnotation id="your-home" coordinate={[longitude, latitude]}>
            <Text>Твой дом, мазафака, находится где-то тут. Я тебя по IP вычислил</Text>
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
});
