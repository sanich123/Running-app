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
export const MOCK_ALTITUDE = 204;
export const MOCK_SPEED = getSpeedInMinsInKm(MOCK_DISTANCE, MOCK_DURATION).paceAsNumber;

export const MOCK_PROFILE = {
  bio: 'Я кароч любитель, но бегаю как профи. Профи меня не любят, потому что я программист и могу бегать в свое удовольствие, но мне как-то пох',
  birthday: new Date('1991-03-11T21:00:00.000Z'),
  city: 'Москва',
  createdAt: '2023-09-27T06:03:22.257Z',
  gender: 'male',
  id: '4d58948f-571f-44f4-8b00-ec1f494187f5',
  name: 'Искандер',
  profilePhoto: 'https://marathonec.ru/wp-content/uploads/2023/05/iskander-yadgarov.jpg',
  sport: 'run',
  surname: 'Ядгаров',
  updatedAt: '2023-09-27T06:03:22.257Z',
  user_id: '9320e08f-299a-468a-8b03-5a1b5ef28ee1',
  weight: '70',
};
