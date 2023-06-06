import { useEffect, useState } from "react";
import { LocationObject, requestForegroundPermissionsAsync, getCurrentPositionAsync } from "expo-location";
import { useAppDispatch } from "../redux/hooks/hooks";
import { setInitialLocation } from "../redux/location-slice/location-slice";

export default function useGetLocation() {
  const [location, setLocation] = useState<LocationObject>();
  const [error, setErrorMsg] = useState(false);
  const dispatch = useAppDispatch();
  useEffect(() => {
    (async () => {
      let { status } = await requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg(true);
        return;
      }
      let location = await getCurrentPositionAsync();
      setLocation(location);
      dispatch(setInitialLocation(location))
    })();
  }, []);
  return { location, error };
}
