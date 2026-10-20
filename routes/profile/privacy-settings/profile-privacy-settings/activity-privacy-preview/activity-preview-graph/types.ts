import type { ActivityPrivacyMetric } from '../types';
import type { LANGUAGES } from '@const/enums';

export interface ActivityPrivacyPreviewMetricOption {
  key: ActivityPrivacyMetric;
  label: string;
  color: string;
  isVisible: boolean;
}

export interface ActivityPreviewGraphProps {
  language: LANGUAGES;
  visibleMetrics: ActivityPrivacyPreviewMetricOption[];
}
