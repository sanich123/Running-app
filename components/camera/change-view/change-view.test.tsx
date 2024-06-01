import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen, userEvent } from '@testing-library/react-native';

import ChangeView from './change-view';

describe('Camera change view', () => {
  it('should correctly handle local state', async () => {
    const setType = jest.fn();
    renderWithProviders(<ChangeView setType={setType} type="front" />, {
      store: mockStore,
    });
    const changeViewBtn = screen.getByTestId('changeViewBtnTestId');
    await userEvent.press(changeViewBtn);
    expect(setType).toHaveBeenCalled();
  });
});
