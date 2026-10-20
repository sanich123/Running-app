import { act, render, screen } from '@testing-library/react-native';
import { MOCK_LOCATION } from '@T/mocks/mock-location';
import RouteKilometreMarkers from './route-kilometre-markers';
import type * as MockNativeViewTools from '@T/utils/mock-native-view';
import type { MockNativeViewProps } from '@T/utils/mock-native-view';

jest.mock('@rnmapbox/maps', () => {
  const { createMockNativeView } = require('@T/utils/mock-native-view') as typeof MockNativeViewTools;
  return {
    ShapeSource: ({ children, ...props }: MockNativeViewProps) =>
      createMockNativeView(props, children, 'route-kilometre-shape-source'),
    CircleLayer: (props: MockNativeViewProps) => createMockNativeView(props, undefined, 'route-kilometre-marker-layer'),
    SymbolLayer: (props: MockNativeViewProps) => createMockNativeView(props, undefined, 'route-kilometre-symbol-layer'),
    MarkerView: ({ children, ...props }: MockNativeViewProps) =>
      createMockNativeView(props, children, 'route-kilometre-callout-marker'),
  };
});

describe('Route kilometre markers', () => {
  it('does not render layers without valid kilometre points', async () => {
    const { queryByText } = await render(<RouteKilometreMarkers kilometresSplit={[]} />);
    expect(queryByText('1')).toBeNull();
  });

  it('renders small points without labels and shows the kilometre after a tap', async () => {
    await render(
      <RouteKilometreMarkers
        kilometresSplit={[
          { lastKilometerDuration: 0, lastKilometerAltitude: 0, kilometerPoint: MOCK_LOCATION },
          { lastKilometerDuration: 0, lastKilometerAltitude: 0, kilometerPoint: MOCK_LOCATION },
        ]}
      />,
    );
    const shapeSource = screen.getByTestId('route-kilometre-shape-source');
    expect(shapeSource.props.shape.features).toEqual([
      expect.objectContaining({ properties: { label: '1', sortKey: 0 } }),
      expect.objectContaining({ properties: { label: '2', sortKey: 1 } }),
    ]);
    expect(shapeSource.props.hitbox).toEqual({ width: 44, height: 44 });
    expect(screen.getByTestId('route-kilometre-marker-layer').props.style).toEqual(
      expect.objectContaining({ circleColor: expect.any(String), circleRadius: 5.5, circleStrokeWidth: 1 }),
    );
    expect(screen.queryByTestId('route-kilometre-symbol-layer')).toBeNull();
    expect(screen.queryByText('1 km')).toBeNull();

    await act(async () =>
      shapeSource.props.onPress({
        features: [shapeSource.props.shape.features[0]],
        coordinates: { longitude: 37.6, latitude: 55.7 },
        point: { x: 100, y: 100 },
      }),
    );
    expect(screen.getByText('1 km')).toBeOnTheScreen();
  });
});
