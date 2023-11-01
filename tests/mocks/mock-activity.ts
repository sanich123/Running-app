import { getSpeedInMinsInKm } from '../../utils/location-utils';

export const MOCK_DURATION = 30851;
export const MOCK_DISTANCE = 49.781129312191226;
export const MOCK_LOCATIONS = [
  {
    coords: {
      accuracy: 56.099998474121094,
      altitude: 204,
      altitudeAccuracy: 100,
      heading: 47.17292785644531,
      latitude: 55.6253046,
      longitude: 37.305884,
      speed: 2.253950357437134,
    },
    timestamp: 1698824159681,
  },
  {
    coords: {
      accuracy: 59.847999572753906,
      altitude: 204,
      altitudeAccuracy: 100,
      heading: 47.17292785644531,
      latitude: 55.62532,
      longitude: 37.3059135,
      speed: 1.0208278894424438,
    },
    timestamp: 1698824164679,
  },
  {
    coords: {
      accuracy: 56.099998474121094,
      altitude: 204,
      altitudeAccuracy: 100,
      heading: 47.17292785644531,
      latitude: 55.6252377,
      longitude: 37.3057562,
      speed: 2.217580556869507,
    },
    timestamp: 1698824154870,
  },
];

export const MOCK_LOCATION = {
  coords: {
    accuracy: 56.099998474121094,
    altitude: 204,
    altitudeAccuracy: 100,
    heading: 47.17292785644531,
    latitude: 55.6253046,
    longitude: 37.305884,
    speed: 2.253950357437134,
  },
  timestamp: 1698824159681,
};
export const MOCK_SPEED = getSpeedInMinsInKm(MOCK_DISTANCE, MOCK_DURATION).paceAsNumber;
