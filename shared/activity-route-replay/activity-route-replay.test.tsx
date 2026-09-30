import type { Ref } from 'react';
import { screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityRouteReplay from './activity-route-replay';
import type { ActivityLocation } from '@S/card/types';

const mockSetCamera = jest.fn();

jest.mock('@rnmapbox/maps', () => {
  const ReactModule = require('react');
  const { View: NativeView } = require('react-native');

  return {
    Camera: ReactModule.forwardRef((_props: unknown, ref: Ref<unknown>) => {
      ReactModule.useImperativeHandle(ref, () => ({ setCamera: mockSetCamera }));
      return null;
    }),
    MapView: NativeView,
    MarkerView: NativeView,
    RasterDemSource: NativeView,
    Terrain: NativeView,
    ShapeSource: NativeView,
    LineLayer: NativeView,
  };
});

const locations = [
  { coords: { longitude: 37.6, latitude: 55.7 } },
  { coords: { longitude: 37.7, latitude: 55.8 } },
] as ActivityLocation[];

describe('activity route replay controls', () => {
  const originalPlatformOS = Platform.OS;

  beforeEach(() => {
    mockSetCamera.mockClear();
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatformOS });
  });

  it('shows the bottom playback panel before playback starts', async () => {
    await renderWithProviders(<ActivityRouteReplay locations={locations} />);

    const toggleButton = screen.getByTestId('activity-route-replay-toggle');

    expect(screen.queryByText('Поставить воспроизведение на паузу')).not.toBeOnTheScreen();
    expect(toggleButton.props.accessibilityLabel).toBe('Начать воспроизведение маршрута');
    expect(screen.getByTestId('activity-route-replay-seekbar')).toBeOnTheScreen();
  });

  it('renders the activity owner avatar at the moving route marker', async () => {
    await renderWithProviders(
      <ActivityRouteReplay
        locations={locations}
        profile={{ name: 'Run', surname: 'User', profilePhoto: 'https://example.test/avatar.jpg' }}
      />,
    );

    expect(screen.getByTestId('activity-route-moving-marker')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-route-moving-avatar').props.source).toEqual({
      uri: 'https://example.test/avatar.jpg',
    });
  });
});
