import type { MapsPageCopy } from '../../const';
import type { LANGUAGES } from '@const/enums';
import type { ActivityRouteWorkoutListItemResponse } from '@R/runich-api/types';

export interface ActivityRouteCardProps {
  activity: ActivityRouteWorkoutListItemResponse;
  copy: MapsPageCopy;
  language: LANGUAGES;
  isWorking: boolean;
  isDisabled: boolean;
  onAdd: (activity: ActivityRouteWorkoutListItemResponse) => void;
}
