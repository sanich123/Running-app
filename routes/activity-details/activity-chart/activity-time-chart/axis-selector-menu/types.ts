import type { ActivityChartMetric } from '../../types';

export interface ActivityChartAxisMenuOption {
  metric: ActivityChartMetric;
  title: string;
  axisTitle: string;
  color: string;
}

export interface ActivityChartAxisMenuProps {
  side: 'left' | 'right';
  axisLabel: string;
  options: ActivityChartAxisMenuOption[];
  selectedMetric: ActivityChartMetric;
  otherMetric: ActivityChartMetric;
  onSelect: (metric: ActivityChartMetric) => void;
}
