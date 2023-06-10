import { useEffect, useRef, useState } from "react";
import { MOCK_LOCATIONS } from "../constants/mocks/mocks";
import { Camera } from "@rnmapbox/maps";
import { STATUSES } from "../constants/enums";

export default function useFakeLocations() {
  const [status, setStatus] = useState("initial");
  const [duration, setDuration] = useState(0);
  const [locations, setLocations] = useState([MOCK_LOCATIONS[0]]);
  const camera = useRef<Camera>(null);

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;
    if (status === STATUSES.started || status === STATUSES.continue) {
      interval = setInterval(() => setDuration((duration) => duration + 1), 1000);
      return () => clearInterval(interval);
    }
    if (status === STATUSES.stopped) {
      clearInterval(interval);
      setDuration(0);
      setLocations([MOCK_LOCATIONS[0]]);
    }
    if (status === STATUSES.paused) {
      clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    if (duration < MOCK_LOCATIONS.length) {
      setLocations([...locations, MOCK_LOCATIONS[duration]]);
    }
  }, [duration]);

  useEffect(() => {
    camera.current?.setCamera({
      centerCoordinate: locations[locations.length - 1],
    });
  }, [locations]);

  return {
    locations,
    lastView: locations[locations.length - 1],
    cameraRef: camera,
    setStatus,
    duration,
    status,
  };
}
