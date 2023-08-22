import { render, screen } from '@testing-library/react-native';

import Checkbox from './checkbox';

jest.useFakeTimers();
describe('Checkbox', () => {
  const isSwitchOn = true;
  const setIsSwitchOn = jest.fn();
  it('should correctly renders', async () => {
    render(<Checkbox isSwitchOn={isSwitchOn} setIsSwitchOn={setIsSwitchOn} />);
    expect(screen.getByText(/Don't publish on Home or Club feeds/i)).toBeDefined();
    const switcher = screen.getByTestId(/switcher/i);
    expect(switcher).toBeDefined();
  });
});
