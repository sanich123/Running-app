import { screen } from '@testing-library/react-native';
import { setInitialLocation, setLastPosition } from '@R/slices/location/location';
import { MOCK_LOCATION } from '@T/mocks/mock-location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import MapNavIcon from './map-nav-icon';

jest.mock('@rnmapbox/maps', () => {
  const { View } = require('react-native');
  return {
    MarkerView: ({ children, ...props }: any) => (
      <View testID="map-nav-marker" {...props}>
        {children}
      </View>
    ),
  };
});
jest.mock('@S/custom-image/custom-image', () => ({
  __esModule: true,
  default: ({ testID, source }: { testID?: string; source: { uri: string } }) => {
    const { Text } = require('react-native');
    return <Text testID={testID}>{source.uri}</Text>;
  },
}));

describe('map nav icon', () => {
  beforeEach(() => mockStore.dispatch(require('@R/slices/location/location').resetLocationSlice()));

  it('does not render a marker before a location is available', async () => {
    await renderWithProviders(<MapNavIcon />);
    expect(screen.queryByTestId('map-nav-marker')).not.toBeOnTheScreen();
  });

  it('renders the latest position and falls back to the profile placeholder', async () => {
    mockStore.dispatch(setInitialLocation(MOCK_LOCATION));
    await renderWithProviders(<MapNavIcon />);

    expect(screen.getByTestId('map-nav-marker').props.coordinate).toEqual([
      MOCK_LOCATION.coords.longitude,
      MOCK_LOCATION.coords.latitude,
    ]);
    expect(screen.getByTestId('map-nav-marker')).toBeOnTheScreen();
  });

  it('prefers the latest position and displays the profile photo', async () => {
    const latestPosition = { ...MOCK_LOCATION, coords: { ...MOCK_LOCATION.coords, latitude: 55.8 } };
    mockStore.dispatch(setInitialLocation(MOCK_LOCATION));
    mockStore.dispatch(setLastPosition(latestPosition));
    await renderWithProviders(<MapNavIcon profilePhoto="https://example.com/avatar.jpg" />);

    expect(screen.getByTestId('map-nav-marker').props.coordinate).toEqual([
      latestPosition.coords.longitude,
      latestPosition.coords.latitude,
    ]);
    expect(screen.getByText('https://example.com/avatar.jpg')).toBeOnTheScreen();
  });
});
