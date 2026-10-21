import { screen } from '@testing-library/react-native';
import { MOCK_LOCATIONS } from '@T/mocks/mock-location';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityMapMarkers from './activity-map-markers';

describe('ActivityMapMarkers', () => {
  it('marks the first and last locations of a route', async () => {
    await renderWithProviders(<ActivityMapMarkers locations={MOCK_LOCATIONS} />);

    expect(screen.getByTestId('activity-map-start-marker')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-map-end-marker')).toBeOnTheScreen();
  });

  it('does not render markers for a route with fewer than two locations', async () => {
    await renderWithProviders(<ActivityMapMarkers locations={[MOCK_LOCATIONS[0]]} />);

    expect(screen.queryByTestId('activity-map-start-marker')).not.toBeOnTheScreen();
  });
});
