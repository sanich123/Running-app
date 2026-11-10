import type React from 'react';
import type { ReactNode } from 'react';
import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import PlaybackDurationMenu from './playback-duration-menu';
import type { ReplayCopy } from '../../types';

jest.mock('@expo/ui/swift-ui', () => {
  const ReactModule = jest.requireActual('react') as typeof React;
  const {
    Pressable,
    Text: NativeText,
    View,
  } = jest.requireActual('react-native') as {
    Pressable: React.ComponentType<React.PropsWithChildren<{ onPress: () => void; testID: string }>>;
    Text: React.ComponentType<React.PropsWithChildren>;
    View: React.ComponentType<React.PropsWithChildren>;
  };
  return {
    Button: ({ label, onPress, testID }: { label: string; onPress: () => void; testID: string }) =>
      ReactModule.createElement(Pressable, { onPress, testID }, ReactModule.createElement(NativeText, null, label)),
    Host: ({ children }: { children: ReactNode }) => ReactModule.createElement(View, null, children),
    Label: ({ title }: { title: string }) => ReactModule.createElement(NativeText, null, title),
    Menu: ({ children, label, testID }: { children: ReactNode; label: ReactNode; testID: string }) => {
      const [visible, setVisible] = ReactModule.useState(false);
      return ReactModule.createElement(
        View,
        null,
        ReactModule.createElement(Pressable, { onPress: () => setVisible(true), testID }, label),
        visible ? children : null,
      );
    },
  };
});
jest.mock('@expo/ui/swift-ui/modifiers', () => ({
  accessibilityLabel: (label: string) => ({ accessibilityLabel: label }),
  disabled: (isDisabled: boolean) => ({ disabled: isDisabled }),
  foregroundStyle: (color: string) => ({ color }),
}));

const copy: ReplayCopy = {
  play: 'Play',
  pause: 'Pause',
  resume: 'Resume',
  replay: 'Replay',
  position: 'Route position',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  duration: 'Duration',
  durationSecondsUnit: 's',
  durationMinutesUnit: 'm',
  playbackTime: 'Playback',
  workoutTime: 'Workout',
  currentSpeed: 'Speed',
  shareVideo: 'Share workout video',
  shareUnavailable: 'Sharing unavailable',
  exportProgress: 'Preparing video',
  videoReady: 'Video ready',
  videoSize: 'File size',
  cancel: 'Cancel',
  share: 'Share',
  kmh: 'km/h',
  satellite: 'Satellite',
  map: 'Map',
};

describe('PlaybackDurationMenu', () => {
  it('passes the chosen replay duration to its owner', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    await renderWithProviders(
      <PlaybackDurationMenu playbackDuration={60_000} copy={copy} isDisabled={false} onSelect={onSelect} />,
    );

    await user.press(screen.getByTestId('activity-route-replay-duration-selector'));
    await user.press(await screen.findByTestId('activity-route-replay-duration-300000'));

    expect(onSelect).toHaveBeenCalledWith(300_000);
  });
});
