import { MOCK_LOCATIONS } from './mock-locations';

export const MOCK_ACTIVITY = {
  createdAt: '2023-11-03T15:28:51.031Z',
  date: '2023-11-03T15:28:51.031Z',
  description: '',
  distance: 8396,
  duration: 3514208,
  emotion: '',
  id: 'e315eb5b-989c-4215-9d14-d77f4e7e2974',
  isSwitchOn: false,
  kilometresSplit: [
    { kilometerPoint: MOCK_LOCATIONS[0], lastKilometerAltitude: 3.29998779296875, lastKilometerDuration: 1375579 },
    { kilometerPoint: MOCK_LOCATIONS[5], lastKilometerAltitude: -14.69999694824219, lastKilometerDuration: 466661 },
    { kilometerPoint: MOCK_LOCATIONS[10], lastKilometerAltitude: 17.5, lastKilometerDuration: 506888 },
    { kilometerPoint: MOCK_LOCATIONS[15], lastKilometerAltitude: -1.800003051757812, lastKilometerDuration: 512964 },
    { kilometerPoint: MOCK_LOCATIONS[20], lastKilometerAltitude: -1.100006103515625, lastKilometerDuration: 491238 },
    { kilometerPoint: MOCK_LOCATIONS[25], lastKilometerAltitude: 0, lastKilometerDuration: 213956 },
    { kilometerPoint: MOCK_LOCATIONS[30], lastKilometerAltitude: 0, lastKilometerDuration: 304661 },
    { kilometerPoint: MOCK_LOCATIONS[35], lastKilometerAltitude: 0, lastKilometerDuration: 353663 },
  ],
  locations: MOCK_LOCATIONS,
  photoUrls: [
    'https://rrlmesbmowaoyzvniffr.supabase.co/storage/v1/object/sign/files/926f4a53-08b5-43c6-99ee-cf31fdfbb49b/1699025324799.jpeg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJmaWxlcy85MjZmNGE1My0wOGI1LTQzYzYtOTllZS1jZjMxZmRmYmI0OWIvMTY5OTAyNTMyNDc5OS5qcGVnIiwiaWF0IjoxNjk5MDI1MzI3LCJleHAiOjI2OTkwMjUzMjd9.i_vqKxSwp0w2PgwYmFcSMcJ84ewfKq0UbJTm85bhTls',
  ],
  speed: 6,
  sport: 'run',
  title: 'Moscow',
  updatedAt: '2023-11-03T15:28:51.031Z',
  user_id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
};
