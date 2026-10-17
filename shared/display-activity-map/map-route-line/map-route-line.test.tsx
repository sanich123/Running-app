import { render, screen } from '@testing-library/react-native';
import { MOCK_LOCATIONS } from '@T/mocks/mock-location';
import MapRouteLine from './map-route-line';

jest.mock('@rnmapbox/maps', () => {
  const { View } = require('react-native');
  return {
    ShapeSource: ({ children, ...props }: any) => (
      <View testID="route-shape-source" {...props}>
        {children}
      </View>
    ),
    LineLayer: View,
  };
});

describe('map route line', () => {
  it('does not draw a line for a segment with a single point', async () => {
    await render(<MapRouteLine locations={[MOCK_LOCATIONS[0]]} />);
    expect(screen.queryByTestId('route-shape-source')).not.toBeOnTheScreen();
  });

  it('draws one GeoJSON line for a valid route', async () => {
    await render(<MapRouteLine locations={MOCK_LOCATIONS} />);
    const source = screen.getByTestId('route-shape-source');
    expect(source.props.shape.features).toHaveLength(1);
    expect(source.props.shape.features[0].geometry.type).toBe('LineString');
  });

  it('draws colored segments and skips a segment without an end point', async () => {
    await render(<MapRouteLine locations={MOCK_LOCATIONS} segmentColors={['#f00', '#0f0', '#00f']} />);

    const [baseRouteSource, coloredSegmentsSource] = screen.getAllByTestId('route-shape-source');
    expect(baseRouteSource.props.shape.features).toHaveLength(1);
    expect(baseRouteSource.props.shape.features[0].geometry.coordinates).toHaveLength(MOCK_LOCATIONS.length);
    expect(coloredSegmentsSource.props.shape.features).toHaveLength(2);
    expect(coloredSegmentsSource.props.shape.features[0].properties).toEqual({ color: '#f00' });
    expect(coloredSegmentsSource.props.shape.features[1].properties).toEqual({ color: '#0f0' });
  });
});
