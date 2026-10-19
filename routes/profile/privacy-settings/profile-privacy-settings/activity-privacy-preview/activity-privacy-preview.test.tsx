import { screen, userEvent, within } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityPrivacyPreview from './activity-privacy-preview';
import { PROFILE_PRIVACY_SETTINGS } from '../../const';

const copy = PROFILE_PRIVACY_SETTINGS[LANGUAGES.russian];

describe('ActivityPrivacyPreview', () => {
  it('shows the full activity sections and chart controls when every metric is allowed', async () => {
    await renderWithProviders(
      <ActivityPrivacyPreview
        allowActivityInteractions
        allowActivityReplayViewing
        allowActivityHeartRateViewing
        allowActivityElevationViewing
        allowActivityPaceViewing
        allowActivitySharing
        language={LANGUAGES.russian}
      />,
    );

    expect(screen.getByText(copy.activityPreviewTitle)).toBeOnTheScreen();
    expect(screen.getByTestId('privacy-activity-preview-map')).toBeOnTheScreen();
    expect(screen.getByTestId('privacy-activity-preview-social-actions')).toBeOnTheScreen();
    expect(screen.getByTestId('privacy-activity-preview-like')).toBeOnTheScreen();
    expect(screen.getByTestId('privacy-activity-preview-comment')).toBeOnTheScreen();
    expect(screen.getByTestId('privacy-activity-preview-share')).toBeOnTheScreen();
    expect(screen.getByTestId('privacy-activity-preview-map-replay')).toBeOnTheScreen();
    expect(screen.getAllByLabelText(copy.activityPreviewReplay)).toHaveLength(1);
    expect(screen.getByTestId('privacy-activity-preview-avatar').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ alignItems: 'center', justifyContent: 'center' })]),
    );
    expect(screen.queryByText(copy.activityPreviewLike)).not.toBeOnTheScreen();
    expect(screen.queryByText(copy.activityPreviewComment)).not.toBeOnTheScreen();
    expect(screen.queryByText(copy.activityPreviewShare)).not.toBeOnTheScreen();
    expect(screen.getByText(copy.activityPreviewDistanceValue)).toBeOnTheScreen();
    expect(screen.getByText(copy.activityPreviewProfileName)).toBeOnTheScreen();
    expect(screen.getByText(copy.activityPreviewActivityName)).toBeOnTheScreen();
    expect(screen.getByText(copy.activityPreviewGraphTitle)).toBeOnTheScreen();
    expect(screen.getByText(copy.activityPreviewHeartRateZones)).toBeOnTheScreen();
    expect(screen.getByText(copy.activityPreviewDetailedStatisticsTitle)).toBeOnTheScreen();
    expect(screen.getByTestId('privacy-activity-preview-axis-left')).toBeOnTheScreen();
    expect(screen.getByTestId('privacy-activity-preview-axis-right')).toBeOnTheScreen();
    expect(screen.getByTestId('privacy-activity-preview-summary-heartRate')).toBeOnTheScreen();
    expect(screen.getByTestId('privacy-activity-preview-summary-elevation')).toBeOnTheScreen();
    expect(screen.getByTestId('privacy-activity-preview-summary-pace')).toBeOnTheScreen();
    expect(screen.getByText(copy.activityPreviewZoneLabel)).toBeOnTheScreen();
    expect(screen.getByText(copy.activityPreviewTime)).toBeOnTheScreen();
    expect(screen.getByTestId('privacy-activity-preview-heart-rate-zone-5')).toBeOnTheScreen();
    expect(screen.getByText('46 %')).toBeOnTheScreen();
    expect(screen.getByText('24:54')).toBeOnTheScreen();
  });

  it('shows hidden heart-rate sections explicitly while keeping allowed graph metrics selectable', async () => {
    await renderWithProviders(
      <ActivityPrivacyPreview
        allowActivityInteractions
        allowActivityReplayViewing
        allowActivityHeartRateViewing={false}
        allowActivityElevationViewing
        allowActivityPaceViewing
        allowActivitySharing
        language={LANGUAGES.russian}
      />,
    );

    expect(screen.getByTestId('privacy-activity-preview-summary-heartRate').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ opacity: 0.3 })]),
    );
    expect(
      within(screen.getByTestId('privacy-activity-preview-detail-heartRate')).getByText(
        copy.activityPreviewMetricHidden,
      ),
    ).toBeOnTheScreen();
    expect(
      within(screen.getByTestId('privacy-activity-preview-heart-rate-zones')).getByText(
        copy.activityPreviewMetricHidden,
      ),
    ).toBeOnTheScreen();
    expect(screen.queryByTestId('privacy-activity-preview-heart-rate-zone-5')).not.toBeOnTheScreen();
    expect(screen.getByTestId('privacy-activity-preview-axis-left')).toHaveProp(
      'accessibilityLabel',
      `${copy.activityPreviewAxisLeft}: ${copy.activityPreviewPaceMetric}`,
    );
  });

  it('hides the graph when fewer than two metrics are allowed', async () => {
    await renderWithProviders(
      <ActivityPrivacyPreview
        allowActivityInteractions
        allowActivityReplayViewing
        allowActivityHeartRateViewing={false}
        allowActivityElevationViewing={false}
        allowActivityPaceViewing
        allowActivitySharing
        language={LANGUAGES.russian}
      />,
    );

    expect(screen.getByText(copy.activityPreviewGraphHidden)).toBeOnTheScreen();
    expect(screen.queryByTestId('privacy-activity-preview-axis-left')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('privacy-activity-preview-axis-right')).not.toBeOnTheScreen();
  });

  it('lets the owner switch a chart axis to another allowed metric', async () => {
    const user = userEvent.setup();
    await renderWithProviders(
      <ActivityPrivacyPreview
        allowActivityInteractions
        allowActivityReplayViewing
        allowActivityHeartRateViewing
        allowActivityElevationViewing
        allowActivityPaceViewing
        allowActivitySharing
        language={LANGUAGES.russian}
      />,
    );

    await user.press(screen.getByTestId('privacy-activity-preview-axis-left'));

    expect(screen.getByTestId('privacy-activity-preview-axis-left')).toHaveProp(
      'accessibilityLabel',
      `${copy.activityPreviewAxisLeft}: ${copy.activityPreviewElevationMetric}`,
    );
  });

  it('shows a hidden map without route replay when route viewing is disabled', async () => {
    await renderWithProviders(
      <ActivityPrivacyPreview
        allowActivityInteractions
        allowActivityReplayViewing={false}
        allowActivityHeartRateViewing
        allowActivityElevationViewing
        allowActivityPaceViewing
        allowActivitySharing
        language={LANGUAGES.russian}
      />,
    );

    expect(screen.getByTestId('privacy-activity-preview-map-hidden')).toBeOnTheScreen();
    expect(screen.getByText(copy.activityPreviewMapHidden)).toBeOnTheScreen();
    expect(screen.queryByTestId('privacy-activity-preview-map-replay')).not.toBeOnTheScreen();
    expect(screen.queryByText(copy.activityPreviewReplay)).not.toBeOnTheScreen();
  });

  it('dims social actions when interaction and sharing are disabled', async () => {
    await renderWithProviders(
      <ActivityPrivacyPreview
        allowActivityInteractions={false}
        allowActivityReplayViewing
        allowActivityHeartRateViewing
        allowActivityElevationViewing
        allowActivityPaceViewing
        allowActivitySharing={false}
        language={LANGUAGES.russian}
      />,
    );

    expect(screen.getByTestId('privacy-activity-preview-like').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ opacity: 0.3 })]),
    );
    expect(screen.getByTestId('privacy-activity-preview-comment').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ opacity: 0.3 })]),
    );
    expect(screen.getByTestId('privacy-activity-preview-share').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ opacity: 0.3 })]),
    );
  });
});
