import { useEffect, useRef, useState } from "react";
import { MOCK_LOCATIONS } from "../constants/mocks/mocks";
import { Camera } from "@rnmapbox/maps";

export default function useFakeLocations() {
  const [duration, setDuration] = useState(0);
  const [locations, setLocations] = useState([MOCK_LOCATIONS[0]]);
  const camera = useRef<Camera>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration((duration) => duration + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
    cameraRef: camera
  };
}
