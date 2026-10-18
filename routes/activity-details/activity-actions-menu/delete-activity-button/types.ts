import type { ReactNode } from 'react';
import type { ActivityResponse } from '@R/runich-api/types';

export interface DeleteActivityButtonProps {
  activity: ActivityResponse;
  renderMenu?: (deleteButton: ReactNode) => ReactNode;
}
