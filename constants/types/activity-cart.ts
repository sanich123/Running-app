import { LocationObject } from 'expo-location';

export type SportsProps = 'run' | 'swim' | 'bike';

export type ActivityCardProps = {
  description: string;
  title: string;
  date: Date;
  sport: SportsProps;
  id: string;
  userId: string;
  locations: LocationObject[];
  photoUrl: string;
  duration: number;
  speed: number;
  distance: number;
};
