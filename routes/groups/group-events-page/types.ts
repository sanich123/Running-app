import type { GROUPS_COPY } from '../const';

export type GroupEventsCopy = (typeof GROUPS_COPY)[keyof typeof GROUPS_COPY];
export type GroupEventPeriod = 'upcoming' | 'past';
export interface GroupEventFormValues {
  title: string;
  description: string;
  locationName: string;
  startsAt: string;
}
