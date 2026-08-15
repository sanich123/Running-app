import { screen, userEvent } from '@testing-library/react-native';
import { ERROR_COMPONENT_TEXT } from './const';
import ErrorComponent from './error-component';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Error component', () => {
  it('should correctly renders info', async () => {
    await renderWithProviders(<ErrorComponent error={{ data: { message: 'some message' }, status: 400 }} />, {
      store: mockStore,
    });
    expect(screen.getByText('400, some message')).toBeOnTheScreen();
  });

  it('retries the failed request', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    await renderWithProviders(<ErrorComponent error={{ status: 500, data: {} }} refetch={refetch} />);
    await user.press(screen.getByText(ERROR_COMPONENT_TEXT.retry));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
