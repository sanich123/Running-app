import { Text, View } from "../Themed";
import { Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import useFakeLocations from "../../hooks/use-fake-locations";
import { useTimer } from "use-timer";

export default function StartBtn() {
  const [modalOpen, setModalOpen] = useState(false);
  const { startTimer } = useFakeLocations();


  return (
    <Pressable
      style={styles.startBtn}
      onPress={() => startTimer()}
    >
      <Text style={styles.textStyle}>{modalOpen ? "Stop" : "Start"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
});
