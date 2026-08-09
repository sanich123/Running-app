import Toast from 'react-native-toast-message';
import { successToast } from './success-toast';

jest.mock('react-native-toast-message', () => ({ show: jest.fn() }));

describe('successToast', () => {
  it('shows a success toast', () => {
    successToast('Saved');
    expect(Toast.show).toHaveBeenCalledWith({ type: 'success', text2: 'Saved' });
  });
});
