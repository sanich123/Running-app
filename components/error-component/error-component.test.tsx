import { screen } from '@testing-library/react-native';

import ErrorComponent from './error-component';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Error component', () => {
  it('should correctly renders info', () => {
    const refetchFn = jest.fn();
    renderWithProviders(
      <ErrorComponent error={{ data: { message: 'some message' }, status: 400 }} refetchFn={refetchFn} />,
      {
        store: mockStore,
      },
    );
    expect(screen.getByText('some message, 400 code')).toBeOnTheScreen();
    expect(screen.getByText('An error occured')).toBeOnTheScreen();
  });
});
