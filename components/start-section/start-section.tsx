import { Text, View } from "../Themed";
import { Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import StartBtn from "../start-btn/start-btn";
import useFakeLocations from "../../hooks/use-fake-locations";

type StartSectionProps = {
  velocity: number;
  distance: number;
};

export default function StartSection({ velocity, distance }: StartSectionProps) {
  const { container, containerMetrics, metrics, metricsHeader, containerStartBtn } = styles;

  const {  duration } = useFakeLocations();
  return (
    <View style={container}>
      <View style={containerMetrics}>
        <View style={metrics}>
          <Text style={metricsHeader}>Темп: </Text>
          <Text>{velocity} мин/км</Text>
        </View>
        <View style={metrics}>
          <Text style={metricsHeader}>Дистанция: </Text>
          <Text>{distance} км</Text>
        </View>
        <View style={metrics}>
          <Text style={metricsHeader}>Время: </Text>
          <Text>{duration} ч</Text>
        </View>
      </View>
      <View style={containerStartBtn}>
        <StartBtn />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerMetrics: {
    flex: 1,
    flexDirection: "row",
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: "space-between",
    height: "60%",
  },
  metrics: {
    // flex: 1,
  },
  metricsHeader: {
    fontSize: 25,
    fontWeight: "bold",
  },

  containerStartBtn: {
    height: "40%",
    flexDirection: "row",
    justifyContent: "center",
  },
});
