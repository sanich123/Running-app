import { Text, View } from "../Themed";
import { Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import StartBtn from "../start-btn/start-btn";
import useFakeLocations from "../../hooks/use-fake-locations";
import { formatDuration } from "../../utils/time-formatter";
import { STATUSES } from "../../constants/enums";

type StartSectionProps = {
  velocity: number;
  distance: number;
  duration: number;
  status: string;
  setStatus: (arg: string) => void;
};

export default function StartSection({ velocity, distance, duration, status, setStatus }: StartSectionProps) {
  const { container, containerMetrics, metricsHeader, containerStartBtn, startBtn, textStyle, containerPauseStopBtns } = styles;
  return (
    <View style={container}>
      <View style={containerMetrics}>
        <View>
          <Text style={metricsHeader}>Темп: </Text>
          <Text>{velocity} мин/км</Text>
        </View>
        <View>
          <Text style={metricsHeader}>Дистанция: </Text>
          <Text>{distance} км</Text>
        </View>
        <View>
          <Text style={metricsHeader}>Время: </Text>
          <Text>{formatDuration(duration)}</Text>
        </View>
      </View>
      <View style={containerStartBtn}>
        {status !== STATUSES.initial && status !== STATUSES.stopped && (
          <View style={containerPauseStopBtns}>
            <Pressable style={startBtn} onPress={() => setStatus(status === STATUSES.paused ? STATUSES.continue : STATUSES.paused)}>
              <Text style={textStyle}>{status === STATUSES.paused ? "Continue" : "Pause"}</Text>
            </Pressable>
            <Pressable style={startBtn} onPress={() => setStatus(STATUSES.stopped)}>
              <Text style={textStyle}>Stop</Text>
            </Pressable>
          </View>
        )}
        {(status === STATUSES.initial || status === STATUSES.stopped) && <StartBtn setStatus={setStatus} />}
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
  metricsHeader: {
    fontSize: 25,
    fontWeight: "bold",
  },
  containerStartBtn: {
    height: "40%",
    flexDirection: "row",
    justifyContent: "center",
  },
  startBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "red",
    borderRadius: 50,
    width: 90,
    height: 90,
  },
  textStyle: {
    fontSize: 28,
    textTransform: "uppercase",
  },
  containerPauseStopBtns: {
    flexDirection: "row",
    gap: 20,
  },
});
