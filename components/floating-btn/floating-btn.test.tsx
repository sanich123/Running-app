import { render, screen, userEvent } from '@testing-library/react-native';

import FloatingBtn from './floating-btn';

describe('Floating btn', () => {
  it('should correctly renders', () => {
    const someFunction = jest.fn();
    render(<FloatingBtn onPressFn={someFunction} />);
    expect(screen.getByTestId('floatingBtn')).toBeOnTheScreen();
  });
  it('should invoke given function', async () => {
    const someFunction = jest.fn();
    render(<FloatingBtn onPressFn={someFunction} />);
    const floatingBtn = screen.getByTestId('floatingBtn');
    await userEvent.press(floatingBtn);
    expect(someFunction).toHaveBeenCalled();
  });
});
