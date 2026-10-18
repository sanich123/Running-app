import { Platform } from 'react-native';
import SegmentedControl from './segmented-control';

function overridePlatformOS(os: typeof Platform.OS) {
  const originalOS = Platform.OS;
  Object.defineProperty(Platform, 'OS', { configurable: true, value: os });
  return () => Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
}

describe('SegmentedControl', () => {
  it('keeps the iOS segmented control native and preserves themed labels', () => {
    const restorePlatform = overridePlatformOS('ios');

    try {
      const nativeProps = SegmentedControl({
        testID: 'native-control',
        values: ['Shown', 'Hidden'],
        selectedIndex: 0,
        tintColor: '#f60',
        backgroundColor: '#ddd',
        fontStyle: { color: '#333', fontSize: 10 },
        activeFontStyle: { color: '#fff', fontSize: 10, fontWeight: '600' },
        sliderStyle: { borderWidth: 0 },
        style: { width: '100%', height: 40, borderRadius: 12, overflow: 'hidden' },
      }).props;
      expect(nativeProps).toEqual(
        expect.objectContaining({
          backgroundColor: undefined,
          activeFontStyle: { color: '#fff', fontSize: 10, fontWeight: '600' },
          fontStyle: { color: '#333', fontSize: 10 },
          sliderStyle: undefined,
          style: { width: '100%' },
          tintColor: '#f60',
        }),
      );
    } finally {
      restorePlatform();
    }
  });

  it('preserves the styled segmented control on Android and web', () => {
    const restorePlatform = overridePlatformOS('android');

    try {
      expect(
        SegmentedControl({
          values: ['Shown', 'Hidden'],
          backgroundColor: '#ddd',
          style: { width: '100%', height: 40, borderRadius: 12, overflow: 'hidden' },
        }).props,
      ).toEqual(
        expect.objectContaining({
          backgroundColor: '#ddd',
          style: { width: '100%', height: 40, borderRadius: 12, overflow: 'hidden' },
        }),
      );
    } finally {
      restorePlatform();
    }
  });
});
