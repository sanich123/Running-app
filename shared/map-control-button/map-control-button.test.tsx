import { screen, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import MapControlButton from './map-control-button';

describe('map control button', () => {
  it('handles a press and exposes its accessible label', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await renderWithProviders(
      <MapControlButton
        accessibilityLabel="Zoom in"
        androidIcon="plus"
        iosSymbol="plus"
        onPress={onPress}
        testID="zoom-in"
      />,
    );

    const button = screen.getByTestId('zoom-in');
    expect(button.props.accessibilityLabel).toBe('Zoom in');
    const buttonStyle = StyleSheet.flatten(button.props.style);
    expect(buttonStyle.backgroundColor).not.toBe('transparent');
    expect(buttonStyle.borderWidth).toBeGreaterThan(0);
    await user.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('blocks presses while loading', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await renderWithProviders(
      <MapControlButton
        accessibilityLabel="Zoom in"
        androidIcon="plus"
        iosSymbol="plus"
        loading
        loadingTestID="zoom-loading"
        onPress={onPress}
        testID="zoom-in"
      />,
    );

    expect(screen.getByTestId('zoom-loading')).toBeOnTheScreen();
    await user.press(screen.getByTestId('zoom-in'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows the native overlay symbol when its platform-specific symbol is missing', async () => {
    await renderWithProviders(
      <MapControlButton
        accessibilityLabel="Download map"
        androidIcon="map"
        androidOverlayIcon="download"
        iosSymbol="map"
        onPress={jest.fn()}
        testID="download-map"
      />,
    );

    expect(screen.getByTestId('download-map')).toBeOnTheScreen();
  });
});
