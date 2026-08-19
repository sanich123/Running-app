import { render, screen, userEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getFloatingButtonPosition } from './const';
import FloatingBtn from './floating-btn';

describe('Floating btn', () => {
  it('should correctly renders', async () => {
    const someFunction = jest.fn();
    await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, right: 0, bottom: 0, left: 0 },
        }}>
        <FloatingBtn onPressFn={someFunction} />
      </SafeAreaProvider>,
    );
    expect(screen.getByTestId('floatingBtn')).toBeOnTheScreen();
  });

  it('keeps the button above the tab bar and safe area', async () => {
    expect(getFloatingButtonPosition({ width: 390, insets: { right: 0, bottom: 34 }, overlapsTabBar: true })).toEqual({
      right: 16,
      bottom: 64,
    });
    expect(getFloatingButtonPosition({ width: 390, insets: { right: 0, bottom: 34 }, overlapsTabBar: false })).toEqual({
      right: 16,
      bottom: 16,
    });
    expect(getFloatingButtonPosition({ width: 1200, insets: { right: 0, bottom: 0 }, overlapsTabBar: false })).toEqual({
      right: 341,
      bottom: 16,
    });
  });

  it('should invoke given function', async () => {
    const someFunction = jest.fn();
    await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, right: 0, bottom: 0, left: 0 },
        }}>
        <FloatingBtn onPressFn={someFunction} />
      </SafeAreaProvider>,
    );
    const floatingBtn = screen.getByTestId('floatingBtn');
    await userEvent.press(floatingBtn);
    expect(someFunction).toHaveBeenCalled();
  });
});
