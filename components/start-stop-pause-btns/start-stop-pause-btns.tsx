import { StyleSheet, Pressable } from "react-native";
import { View, Text } from "../Themed";
import { STATUSES } from "../../constants/enums";

type StartStopPauseBtnsProps = {
  status: STATUSES;
  setStatus: (arg: STATUSES) => void;
};

export default function StartStopPauseBtns({ status, setStatus }: StartStopPauseBtnsProps) {
  const { containerStartBtn, containerPauseStopBtns, textStyle, startBtn } = styles;
  return (
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
      {(status === STATUSES.initial || status === STATUSES.stopped) && (
        <Pressable style={styles.startBtn} onPress={() => setStatus(STATUSES.started)}>
          <Text style={styles.textStyle}>Start</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
