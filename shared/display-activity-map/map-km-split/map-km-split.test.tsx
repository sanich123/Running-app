import { act, render, screen } from '@testing-library/react-native';
import { MOCK_LOCATION } from '@T/mocks/mock-location';
import MapKmSplit from './map-km-split';

jest.mock('@rnmapbox/maps', () => {
  const { View } = require('react-native');
  return {
    ShapeSource: ({ children, ...props }: any) => (
      <View testID="km-shape-source" {...props}>
        {children}
      </View>
    ),
    CircleLayer: (props: any) => <View testID="km-circle-layer" {...props} />,
    SymbolLayer: (props: any) => <View testID="km-symbol-layer" {...props} />,
    MarkerView: ({ children, ...props }: any) => (
      <View testID="km-callout-marker" {...props}>
        {children}
      </View>
    ),
  };
});

describe('map km split', () => {
  it('does not render layers without valid kilometre points', async () => {
    const { queryByText } = await render(<MapKmSplit kilometresSplit={[]} />);
    expect(queryByText('1')).toBeNull();
  });

  it('renders small points without labels and shows the kilometre after a tap', async () => {
    await render(
      <MapKmSplit
        kilometresSplit={[{ kilometerPoint: MOCK_LOCATION } as any, { kilometerPoint: MOCK_LOCATION } as any]}
      />,
    );
    const shapeSource = screen.getByTestId('km-shape-source');
    expect(shapeSource.props.shape.features).toEqual([
      expect.objectContaining({ properties: { label: '1', sortKey: 0 } }),
      expect.objectContaining({ properties: { label: '2', sortKey: 1 } }),
    ]);
    expect(shapeSource.props.hitbox).toEqual({ width: 44, height: 44 });
    expect(screen.getByTestId('km-circle-layer').props.style).toEqual(
      expect.objectContaining({ circleColor: expect.any(String), circleRadius: 5.5, circleStrokeWidth: 1 }),
    );
    expect(screen.queryByTestId('km-symbol-layer')).toBeNull();
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
