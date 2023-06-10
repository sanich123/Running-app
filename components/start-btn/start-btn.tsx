import { Text, View } from "../Themed";
import { Pressable, StyleSheet } from "react-native";
import { useState } from "react";

export default function StartBtn({ setStatus }: { setStatus: (arg: string) => void}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Pressable style={styles.startBtn} onPress={() => setStatus('started')}>
      <Text style={styles.textStyle}>Start</Text>
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
