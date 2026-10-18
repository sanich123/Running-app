import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import PauseMarker from './pause-marker';

describe('PauseMarker', () => {
  it('renders the marker at the activity location', async () => {
    await renderWithProviders(
      <PauseMarker
        location={{
          coords: {
            longitude: 37.6,
            latitude: 55.7,
            altitude: null,
            accuracy: 5,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        }}
        isResume={false}
      />,
    );

    expect(screen.getByTestId('pause-marker')).toBeOnTheScreen();
  });
});
