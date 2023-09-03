import { LocationObject } from 'expo-location';
import { createContext } from 'react';

import { STATUSES } from '../../constants/enums';

export const ActivityComponentContext = createContext({
  setStatus: (arg: STATUSES) => {},
  status: 'initial',
  locations: [] as LocationObject[],
  duration: 0,
  cameraRef: null,
  lastView: [0, 0],
  distance: 0,
  mapVisible: true,
  setMapVisible: (arg: boolean) => {},
});
