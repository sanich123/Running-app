//example

// import { MapView } from '@rnmapbox/maps';
// import { LocationObject, watchPositionAsync } from 'expo-location';
// import { useEffect, useRef, useState } from 'react';

// import { POSITION_OPTIONS } from '../../constants/const';
// import { getDistance, paceBetween } from '../location-utils';

// export default function useGetDistancePosition({ initialLocation }: { initialLocation: LocationObject }) {
//   const [positions, setPositions] = useState<LocationObject[]>([]);
//   const [distance, setDistance] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [pace, setPace] = useState(0);

//   const mapRef = useRef<MapView>(null);

//   const currentPosition = !positions.length ? initialLocation : positions[positions.length - 1];

//   useEffect(() => {
//     (async function setPosition() {
//       return await watchPositionAsync(POSITION_OPTIONS, (position: LocationObject) => {
//         const currDistance = positions[0] ? getDistance(currentPosition, position) : 0;
//         const duration = positions[0] ? position.timestamp - positions[0].timestamp : 0;

//         const pace = positions[0] ? paceBetween(distance, positions[positions.length - 1], position) : 0;
//         setPositions([...positions, position]);
//         setDistance(distance + currDistance);
//         setPace(pace);
//         setDuration(duration);
//       });
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return {
//     currentPosition,
//     distance,
//     duration,
//     positions,
//     pace,
//     mapRef,
//   };
// }
