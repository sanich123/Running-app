import { screen } from '@testing-library/react-native';
import { MOCK_LOCATION } from '@T/mocks/mock-location';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityMapMarker from './activity-map-marker';

describe('ActivityMapMarker', () => {
  it('renders the start marker with an accessible label', async () => {
    await renderWithProviders(<ActivityMapMarker location={MOCK_LOCATION} type="start" />);

    expect(screen.getByTestId('activity-map-start-marker')).toBeOnTheScreen();
  });
});
