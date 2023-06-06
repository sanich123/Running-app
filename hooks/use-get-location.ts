import { useEffect, useState } from "react";
import { LocationObject, requestForegroundPermissionsAsync, getCurrentPositionAsync } from "expo-location";
import { useAppDispatch } from "../redux/hooks/hooks";
import { setInitialLocation } from "../redux/location-slice/location-slice";
import Mapbox from "@rnmapbox/maps";

export default function useGetLocation() {
  Mapbox.setWellKnownTileServer("Mapbox");
  Mapbox.setAccessToken("pk.eyJ1Ijoic2FuaWNoMTIzIiwiYSI6ImNsaWFkNmptaDAyaTczcm11NHF0cmp3d2sifQ.ZKH9THateIfnZ7zC23f3-g");

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
