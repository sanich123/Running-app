import { createContext, useContext } from 'react';
import type { ActivityCardData } from './types';

interface ActivityCardContextValue {
  activity: ActivityCardData;
  isFullView: boolean;
  isShowDescription: boolean;
}

export const ActivityCardContext = createContext<ActivityCardContextValue | undefined>(undefined);

export function useActivityCard() {
  const context = useContext(ActivityCardContext);

  if (!context) {
    throw new Error('Activity card components must be rendered inside an ActivityCard.');
  }

  return context;
}
