import { screen, userEvent } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import MapMetaButton from './map-meta-button';

describe('map meta button', () => {
  it('uses a borderless circular touch target and responds to a press', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await renderWithProviders(
      <MapMetaButton accessibilityLabel="Replay route" onPress={onPress} testID="map-meta-button">
        <Text>Icon</Text>
      </MapMetaButton>,
    );

    const buttonContainer = screen.getByTestId('map-meta-button-container');
    const buttonContainerStyle = StyleSheet.flatten(buttonContainer.props.style);
    expect(buttonContainerStyle).toEqual(
      expect.objectContaining({ borderRadius: 20, borderWidth: 0, overflow: 'hidden' }),
    );
    expect(buttonContainerStyle.backgroundColor).toBe('transparent');
    const button = screen.getByTestId('map-meta-button');
    await user.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
