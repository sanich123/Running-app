import { render, screen, userEvent } from '@testing-library/react-native';
import FloatingBtn from './floating-btn';

describe('Floating btn', () => {
  it('should correctly renders', async () => {
    const someFunction = jest.fn();
    await render(<FloatingBtn onPressFn={someFunction} />);
    expect(screen.getByTestId('floatingBtn')).toBeOnTheScreen();
  });
  it('should invoke given function', async () => {
    const someFunction = jest.fn();
    await render(<FloatingBtn onPressFn={someFunction} />);
    const floatingBtn = screen.getByTestId('floatingBtn');
    await userEvent.press(floatingBtn);
    expect(someFunction).toHaveBeenCalled();
  });
});
