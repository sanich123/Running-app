import { formatDuration } from "../../utils/time-formatter";
import { View, Text } from "../Themed";
import { StyleSheet } from "react-native";

type MetricsProps = {
  velocity: number;
  distance: number;
  duration: number;
};

export default function Metrics({ velocity, distance, duration }: MetricsProps) {
  const { containerMetrics, metricsHeader } = styles;
  return (
    <View style={containerMetrics}>
      <View>
        <Text style={metricsHeader}>Темп: </Text>
        <Text>{velocity} мин/км</Text>
      </View>
      <View>
        <Text style={metricsHeader}>Дистанция: </Text>
        <Text>{(distance / 1000).toFixed(3)} км</Text>
      </View>
      <View>
        <Text style={metricsHeader}>Время: </Text>
        <Text>{formatDuration(duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
