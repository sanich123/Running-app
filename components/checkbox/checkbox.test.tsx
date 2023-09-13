import { render, screen } from '@testing-library/react-native';

import Checkbox from './checkbox';

jest.useFakeTimers();
describe('Checkbox', () => {
  it('should correctly renders', async () => {
    render(<Checkbox />);
    expect(screen.getByText(/Don't publish on Home or Club feeds/i)).toBeDefined();
    const switcher = screen.getByTestId(/switcher/i);
    expect(switcher).toBeDefined();
  });
});
