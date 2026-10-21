import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { PROFILE_PRIVACY_SETTINGS } from '../../../const';
import { ACTIVITY_PREVIEW_METRIC_COLORS } from '../const';
import ActivityPreviewGraph from './activity-preview-graph';
import type { ActivityPreviewGraphProps } from './types';

const visibleMetrics: ActivityPreviewGraphProps['visibleMetrics'] = [
  {
    key: 'heartRate',
    label: PROFILE_PRIVACY_SETTINGS[LANGUAGES.russian].activityPreviewHeartRateMetric,
    color: ACTIVITY_PREVIEW_METRIC_COLORS.heartRate,
    isVisible: true,
  },
  {
    key: 'pace',
    label: PROFILE_PRIVACY_SETTINGS[LANGUAGES.russian].activityPreviewPaceMetric,
    color: ACTIVITY_PREVIEW_METRIC_COLORS.pace,
    isVisible: true,
  },
  {
    key: 'elevation',
    label: PROFILE_PRIVACY_SETTINGS[LANGUAGES.russian].activityPreviewElevationMetric,
    color: ACTIVITY_PREVIEW_METRIC_COLORS.elevation,
    isVisible: true,
  },
];

describe('ActivityPreviewGraph', () => {
  it('shows graph controls and cycles the left axis through allowed metrics', async () => {
    const user = userEvent.setup();
    const { getByTestId } = await renderWithProviders(
      <ActivityPreviewGraph language={LANGUAGES.russian} visibleMetrics={visibleMetrics} />,
    );
    const copy = PROFILE_PRIVACY_SETTINGS[LANGUAGES.russian];

    expect(getByTestId('privacy-activity-preview-graph')).toBeOnTheScreen();
    expect(screen.getByTestId('privacy-activity-preview-axis-left')).toHaveProp(
      'accessibilityLabel',
      `${copy.activityPreviewAxisLeft}: ${copy.activityPreviewHeartRateMetric}`,
    );
    await user.press(getByTestId('privacy-activity-preview-axis-left'));
    expect(screen.getByTestId('privacy-activity-preview-axis-left')).toHaveProp(
      'accessibilityLabel',
      `${copy.activityPreviewAxisLeft}: ${copy.activityPreviewElevationMetric}`,
    );
  });

  it('hides the graph controls when fewer than two metrics are available', async () => {
    const copy = PROFILE_PRIVACY_SETTINGS[LANGUAGES.russian];
    await renderWithProviders(
      <ActivityPreviewGraph language={LANGUAGES.russian} visibleMetrics={visibleMetrics.slice(0, 1)} />,
    );

    expect(screen.getByText(copy.activityPreviewGraphHidden)).toBeOnTheScreen();
    expect(screen.queryByTestId('privacy-activity-preview-axis-left')).toBeNull();
  });
});
