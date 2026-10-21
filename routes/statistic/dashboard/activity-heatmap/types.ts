import type {
  DashboardActivityGroup,
  DashboardHeatmapCell,
  DashboardHeatmapMonth,
  DashboardLabels,
  DashboardMetric,
} from '../types';
import type { LANGUAGES } from '@const/enums';

export interface ActivityHeatmapProps {
  heatmapColumns: DashboardHeatmapCell[][];
  monthSpans: DashboardHeatmapMonth[];
  selectedDay: Date;
  selectedDayGroups: DashboardActivityGroup[];
  selectedDayIntensity: number;
  metric: DashboardMetric;
  labels: DashboardLabels;
  language: LANGUAGES;
  onDayPress: (date: Date) => void;
  onOpenMonth: () => void;
}
