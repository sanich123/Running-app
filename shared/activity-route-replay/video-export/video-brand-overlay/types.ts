import type { ReplayCopy } from '../../types';
import type { LANGUAGES } from '@const/enums';
import type { ProfileType } from '@S/card/types';

export interface VideoBrandOverlayProps {
  sport?: string;
  workoutDate?: string;
  profile?: ProfileType;
  workoutDuration: number;
  distance: number;
  progress: number;
  currentSpeed: number | null;
  language: LANGUAGES;
  copy: ReplayCopy;
  isCoverFrame?: boolean;
  onCoverReady?: () => void;
}
