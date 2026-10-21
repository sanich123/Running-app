import { screen } from '@testing-library/react-native';
import { setInitialLocation, setLastPosition } from '@R/slices/location/location';
import { MOCK_LOCATION } from '@T/mocks/mock-location';
import { mockStore, resetMockLocation } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import MapNavIcon from './map-nav-icon';
import type { MockNativeViewProps } from '@T/utils/mock-native-view';
import type * as MockNativeViewTools from '@T/utils/mock-native-view';

jest.mock('@rnmapbox/maps', () => {
  const { createMockNativeView } = require('@T/utils/mock-native-view') as typeof MockNativeViewTools;
  return {
    MarkerView: ({ children, ...props }: MockNativeViewProps) =>
      createMockNativeView(props, children, 'map-nav-marker'),
  };
});
describe('map nav icon', () => {
  beforeEach(() => mockStore.dispatch(resetMockLocation()));

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
    await renderWithProviders(
      <MapNavIcon profilePhoto="https://example.com/avatar.jpg" profilePhotoBlurhash="avatar-blurhash" />,
    );

    expect(screen.getByTestId('map-nav-marker').props.coordinate).toEqual([
      latestPosition.coords.longitude,
      latestPosition.coords.latitude,
    ]);
    const avatar = screen.getByTestId('map-nav-avatar');
    expect(avatar.props.source).toEqual({ uri: 'https://example.com/avatar.jpg' });
    expect(avatar.props.placeholder).toBe('blurhash:/avatar-blurhash');
  });
});
