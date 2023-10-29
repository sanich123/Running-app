import { render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import ActivityCloseBtn from './activity-close-btn';
import { store } from '../../redux/store';

describe('Activity-close-btn', () => {
  it('should correctly renders', () => {
    render(
      <Provider store={store}>
        <ActivityCloseBtn />
      </Provider>,
    );
    expect(screen.getByText(/close/i)).toBeDefined();
  });
});
