import { screen } from '@testing-library/react-native';

import ErrorComponent from '../../components/error-component/error-component';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

describe('Error component', () => {
  it('should correctly renders info', () => {
    renderWithProviders(<ErrorComponent error={{ data: { message: 'some message' }, status: 400 }} />, {
      store: mockStore,
    });
    expect(screen.getByText('some message, 400 code')).toBeOnTheScreen();
    expect(screen.getByText('An error occured')).toBeOnTheScreen();
  });
});
