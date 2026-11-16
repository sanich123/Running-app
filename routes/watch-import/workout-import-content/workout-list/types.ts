import type { WatchWorkout } from '../../../../modules/runich-health/src/RunichHealth';

interface WorkoutListCopy {
  iosNoWorkouts: string;
  noWorkouts: string;
  hideFromImport: string;
  hiddenWorkouts: string;
  restoreToImport: string;
  workoutSignals: {
    heartRateAvailable: string;
    gpsAvailable: string;
  };
}

export interface WorkoutListProps {
  copy: WorkoutListCopy;
  hiddenWorkouts: WatchWorkout[];
  importSelected: () => Promise<void>;
  isConnected: boolean;
  isImporting: boolean;
  isIOS: boolean;
  isReading: boolean;
  isRussian: boolean;
  restoreWorkout: (workout: WatchWorkout) => Promise<void>;
  selectedIds: Set<string>;
  selectedWorkoutsCount: number;
  toggleWorkout: (workout: WatchWorkout) => void;
  hideWorkout: (workout: WatchWorkout) => Promise<void>;
  workouts: WatchWorkout[];
}
