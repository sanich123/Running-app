import { render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import ActivityErrorMsg from './activity-error-msg';
import { store } from '../../redux/store';

describe('Activity-error-msg', () => {
  it('should correctly renders', () => {
    render(
      <Provider store={store}>
        <ActivityErrorMsg />
      </Provider>,
    );
    screen.debug();
  });
});
