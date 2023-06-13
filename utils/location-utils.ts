import { LocationObject } from "expo-location";
import * as turf from "@turf/turf";

export function getDistance(origin: LocationObject, destination: LocationObject) {
  const from = turf.point([origin.coords.longitude, origin.coords.latitude]);
  const to = turf.point([destination.coords.longitude, destination.coords.latitude]);
  return turf.distance(from, to, { units: "meters" });
}

export function getDistanceFromMocks(from: number[], to: number[]) {
  return turf.distance(from, to, { units: "meters" });
}
