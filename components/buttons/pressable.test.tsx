import { render, screen, userEvent } from '@testing-library/react-native';

import Button from './pressable';

const fn = jest.fn();
const user = userEvent.setup();
it('should correctly renders', async () => {
  jest.useFakeTimers();
  render(<Button onPress={fn} label="Какая-то кнопка" />);
  const pressableBtn = screen.getByText('Какая-то кнопка');
  expect(pressableBtn).toBeDefined();
  await user.press(pressableBtn);
  expect(fn).toHaveBeenCalled();
  jest.useRealTimers();
});
