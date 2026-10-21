import type {
  DashboardLabels,
  DashboardMetric,
  DashboardMetricTotals,
  DashboardSport,
  DashboardSportOption,
} from '../types';
import type { LANGUAGES } from '@const/enums';

export interface SportDistributionProps {
  sports: Record<string, DashboardMetricTotals>;
  totals: DashboardMetricTotals;
  sportOptions: DashboardSportOption[];
  selectedSport: DashboardSport;
  metric: DashboardMetric;
  labels: DashboardLabels;
  language: LANGUAGES;
  onSportChange: (sport: DashboardSport) => void;
}
