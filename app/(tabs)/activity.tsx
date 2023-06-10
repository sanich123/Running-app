import { StyleSheet } from "react-native";
import { Text, View } from "../../components/Themed";
import Map from "../../components/map/map";
import StartSection from "../../components/start-section/start-section";

export default function Activity() {
  const { page, container, monitor } = styles;
  return (
    <View style={page}>
      <View style={container}>
        <Map />
      </View>
      <View style={monitor}>
        <StartSection distance={11} velocity={5.5} />
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
});
