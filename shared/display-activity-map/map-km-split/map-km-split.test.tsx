import { render, screen } from '@testing-library/react-native';
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
    CircleLayer: View,
    SymbolLayer: View,
  };
});

describe('map km split', () => {
  it('does not render layers without valid kilometre points', async () => {
    const { queryByText } = await render(<MapKmSplit kilometresSplit={[]} />);
    expect(queryByText('1')).toBeNull();
  });

  it('creates a numbered feature for every valid kilometre point', async () => {
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
  });
});
