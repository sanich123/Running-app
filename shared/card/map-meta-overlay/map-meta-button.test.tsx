import { screen, userEvent } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import MapMetaButton from './map-meta-button';

describe('map meta button', () => {
  it('uses the circular map-chip size and responds to a press', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await renderWithProviders(
      <MapMetaButton accessibilityLabel="Replay route" onPress={onPress} testID="map-meta-button">
        <Text>Icon</Text>
      </MapMetaButton>,
    );

    const button = screen.getByTestId('map-meta-button');
    expect(StyleSheet.flatten(button.props.style)).toEqual(
      expect.objectContaining({ width: 42, height: 42, borderRadius: 21 }),
    );
    await user.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
