import Toast from 'react-native-toast-message';
import { infoToast } from './info-toast';

jest.mock('react-native-toast-message', () => ({ show: jest.fn() }));

describe('infoToast', () => {
  it('shows an info toast', () => {
    infoToast('Location accuracy is low');
    expect(Toast.show).toHaveBeenCalledWith({ type: 'info', text2: 'Location accuracy is low' });
  });
});
