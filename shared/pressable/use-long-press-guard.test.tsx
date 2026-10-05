import { fireEvent, render, screen } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';
import useLongPressGuard from './use-long-press-guard';

const mockPress = jest.fn();

function GuardedPressable() {
  const { resetForGesture, markLongPress, shouldHandlePress } = useLongPressGuard();

  return (
    <Pressable
      testID="guarded-pressable"
      onPressIn={resetForGesture}
      onLongPress={markLongPress}
      onPress={() => {
        if (shouldHandlePress()) mockPress();
      }}>
      <Text>Media</Text>
    </Pressable>
  );
}

describe('useLongPressGuard', () => {
  beforeEach(() => mockPress.mockClear());

  it('suppresses the tap from a long press and allows the next tap', async () => {
    await render(<GuardedPressable />);
    const pressable = screen.getByTestId('guarded-pressable');

    await fireEvent(pressable, 'pressIn');
    await fireEvent(pressable, 'longPress');
    await fireEvent.press(pressable);
    expect(mockPress).not.toHaveBeenCalled();

    await fireEvent(pressable, 'pressIn');
    await fireEvent.press(pressable);
    expect(mockPress).toHaveBeenCalledTimes(1);
  });
});
