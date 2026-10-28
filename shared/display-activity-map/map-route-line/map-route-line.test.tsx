import { screen } from '@testing-library/react-native';
import { restoreLocationsFromJournal } from '@R/slices/location/location';
import { MOCK_LOCATIONS } from '@T/mocks/mock-location';
import { mockStore, resetMockLocation } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import MapRouteLine from './map-route-line';
import type * as MockNativeViewTools from '@T/utils/mock-native-view';
import type { MockNativeViewProps } from '@T/utils/mock-native-view';

jest.mock('@rnmapbox/maps', () => {
  const { createMockNativeView } = require('@T/utils/mock-native-view') as typeof MockNativeViewTools;
  return {
    ShapeSource: ({ children, ...props }: MockNativeViewProps) =>
      createMockNativeView(props, children, 'route-shape-source'),
    LineLayer: ({ ...props }: MockNativeViewProps) => createMockNativeView(props),
  };
});

describe('map route line', () => {
  beforeEach(() => {
    mockStore.dispatch(resetMockLocation());
  });

  it('does not draw a line for a segment with a single point', async () => {
    await renderWithProviders(<MapRouteLine locations={[MOCK_LOCATIONS[0]]} />);
    expect(screen.queryByTestId('route-shape-source')).not.toBeOnTheScreen();
  });

  it('draws one GeoJSON line for a valid route', async () => {
    await renderWithProviders(<MapRouteLine locations={MOCK_LOCATIONS} />);
    const source = screen.getByTestId('route-shape-source');
    expect(source.props.shape.features).toHaveLength(1);
    expect(source.props.shape.features[0].geometry.type).toBe('LineString');
  });

  it('draws colored segments and skips a segment without an end point', async () => {
    await renderWithProviders(<MapRouteLine locations={MOCK_LOCATIONS} segmentColors={['#f00', '#0f0', '#00f']} />);

    const [baseRouteSource, coloredSegmentsSource] = screen.getAllByTestId('route-shape-source');
    expect(baseRouteSource.props.shape.features).toHaveLength(1);
    expect(baseRouteSource.props.shape.features[0].geometry.coordinates).toHaveLength(MOCK_LOCATIONS.length);
    expect(coloredSegmentsSource.props.shape.features).toHaveLength(2);
    expect(coloredSegmentsSource.props.shape.features[0].properties).toEqual({ color: '#f00' });
    expect(coloredSegmentsSource.props.shape.features[1].properties).toEqual({ color: '#0f0' });
  });

  it('reads route locations from Redux when they are not passed as props', async () => {
    mockStore.dispatch(
      restoreLocationsFromJournal({ locationsFromBackground: [], locationsWithPauses: [MOCK_LOCATIONS] }),
    );

    await renderWithProviders(<MapRouteLine />);

    expect(screen.getByTestId('route-shape-source').props.shape.features[0].geometry.coordinates).toHaveLength(
      MOCK_LOCATIONS.length,
    );
  });
});
