import { render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import Checkbox from './checkbox';
import { store } from '../../redux/store';

jest.useFakeTimers();
describe('Checkbox', () => {
  it('should correctly renders', async () => {
    render(
      <Provider store={store}>
        <Checkbox />
      </Provider>,
    );
    expect(screen.getByText(/Don't publish on Home or Club feeds/i)).toBeDefined();
    const switcher = screen.getByTestId(/switcher/i);
    expect(switcher).toBeDefined();
  });
});
