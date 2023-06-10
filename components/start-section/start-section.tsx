import { View } from "../Themed";
import { STATUSES } from "../../constants/enums";
import Metrics from "../metrics/metrics";
import StartStopPauseBtns from "../start-stop-pause-btns/start-stop-pause-btns";

type StartSectionProps = {
  velocity: number;
  distance: number;
  duration: number;
  status: STATUSES;
  setStatus: (arg: STATUSES) => void;
};

export default function StartSection({ velocity, distance, duration, status, setStatus }: StartSectionProps) {
  return (
    <View style={{ flex: 1 }}>
      <Metrics velocity={velocity} distance={distance} duration={duration} />
      <StartStopPauseBtns status={status} setStatus={setStatus} />
    </View>
  );
}
