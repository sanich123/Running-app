import type { ActivityPhoto } from '@R/slices/activity/types';

export interface PreviewImagesProps {
  images: ActivityPhoto[];
  isDisabled: boolean;
  compact?: boolean;
  horizontal?: boolean;
  activityId?: string;
  isPersistedActivityMedia?: boolean;
  setImages: (arg: ActivityPhoto[]) => void;
}
