import type { ActivityPhoto } from '@R/slices/activity/types';
export interface MediaSectionProps {
  images: ActivityPhoto[];
  isEditingActivity: boolean;
  activityId?: string;
  setImages: (arg: ActivityPhoto[]) => void;
}
