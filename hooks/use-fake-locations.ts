import { useEffect, useRef, useState } from "react";
import { MOCK_LOCATIONS } from "../constants/mocks/mocks";
import { Camera } from "@rnmapbox/maps";
import { formatDuration } from "../utils/time-formatter";
import { useTimer } from "use-timer";

export default function useFakeLocations() {
  const { time, start, pause, reset, status } = useTimer();
  const [duration, setDuration] = useState(0);
  const [locations, setLocations] = useState([MOCK_LOCATIONS[0]]);
  const camera = useRef<Camera>(null);
  console.log(time < MOCK_LOCATIONS.length, locations)

  useEffect(() => {

    if (time < MOCK_LOCATIONS.length) {
      setLocations([...locations, MOCK_LOCATIONS[time]]);
    }
  }, [time]);

  useEffect(() => {
    camera.current?.setCamera({
      centerCoordinate: locations[locations.length - 1],
    });
  }, [locations]);

  return {
    locations,
    lastView: locations[locations.length - 1],
    cameraRef: camera,
    duration: formatDuration(duration),
    startTimer: () => start(),
  };
}
