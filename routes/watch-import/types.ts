import type { PropsWithChildren } from 'react';
import type { DiagnosticItem, ReadDiagnostics, UploadDiagnostics } from './workout-import/types';
import type { HealthPermissionsResult, WatchWorkout } from '../../modules/runich-health/src/RunichHealth';

export interface DiagnosticsCardProps {
  availability: string | null;
  healthPermissions: HealthPermissionsResult | null;
  healthStatusErrorCode: string | null;
  isConnected: boolean;
  isReading: boolean;
  isRussian: boolean;
  readDiagnostics: ReadDiagnostics | null;
  uploadDiagnostics: UploadDiagnostics | null;
  userId: string | null;
  workouts: WatchWorkout[];
}

export interface DiagnosticsSectionProps extends PropsWithChildren {
  icon: string;
  title: string;
}

export interface DiagnosticMetricProps {
  isRussian: boolean;
  label: string;
  value?: string;
  status?: boolean;
}

export interface ViewWithIconProps {
  icon: string;
  subtitle: string;
  title: string;
}

export interface DiagnosticListProps {
  items: DiagnosticItem[];
}
