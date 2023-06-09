import { useEffect, useState } from "react";
import { MOCK_LOCATIONS } from "../constants/mocks/mocks";

export default function useFakeLocations() {
  const [duration, setDuration] = useState(0);
  const [locations, setLocations] = useState([MOCK_LOCATIONS[0]]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration((duration) => duration + 1);
      setLocations((locations) => [...locations, MOCK_LOCATIONS[duration]]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return locations;
}
