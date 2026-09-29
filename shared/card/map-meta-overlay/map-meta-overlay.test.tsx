import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import MapMetaOverlay from './map-meta-overlay';

describe('map metadata overlay', () => {
  it('renders nothing for blank or invalid metadata', async () => {
    await renderWithProviders(
      <MapMetaOverlay
        locationName="   "
        weatherTemperature={Number.POSITIVE_INFINITY}
        weatherWindSpeed={Number.NaN}
        emotion="unknown"
      />,
    );

    expect(screen.queryByText('Central park')).toBeNull();
    expect(screen.queryByText(/°C/)).toBeNull();
    expect(screen.queryByText(/м\/с/)).toBeNull();
    expect(screen.queryByTestId('map-emotion-icon')).toBeNull();
  });

  it('trims location names, rounds weather values, and shows recognized emotions', async () => {
    await renderWithProviders(
      <MapMetaOverlay
        locationName="  Central park  "
        weatherTemperature={18.6}
        weatherWindSpeed={4.4}
        weatherCode={0}
        emotion="energetic"
      />,
    );

    expect(screen.getByText('Central park')).toBeOnTheScreen();
    expect(screen.getByText('19°C')).toBeOnTheScreen();
    expect(screen.getByText('4 м/с')).toBeOnTheScreen();
    expect(screen.getByTestId('map-emotion-icon')).toBeOnTheScreen();
  });

  it.each([0, 1, 2, 3, 45, 48, 51, 82, 71, 86, 95, 96, 99, 100])(
    'renders a temperature for weather code %s',
    async (weatherCode) => {
      await renderWithProviders(<MapMetaOverlay weatherTemperature={12} weatherCode={weatherCode} />);
      expect(screen.getByText('12°C')).toBeOnTheScreen();
    },
  );

  it.each(['good', 'normal', 'fucked', 'hard', 'calm', 'invalid'])('handles emotion value %s', async (emotion) => {
    await renderWithProviders(<MapMetaOverlay locationName="Route" emotion={emotion} />);
    if (emotion === 'invalid') {
      expect(screen.queryByTestId('map-emotion-icon')).toBeNull();
    } else {
      expect(screen.getByTestId('map-emotion-icon')).toBeOnTheScreen();
    }
  });
});
