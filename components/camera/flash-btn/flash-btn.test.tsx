import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen, userEvent } from '@testing-library/react-native';

import FlashBtn from './flash-btn';

describe('Camera flash btn', () => {
  it('should correctly handle local state', async () => {
    const setFlashEnable = jest.fn();
    renderWithProviders(<FlashBtn setFlashEnable={setFlashEnable} flashEnable="off" />, {
      store: mockStore,
    });
    const flashBtn = screen.getByTestId('FlashBtnTestId');
    await userEvent.press(flashBtn);
    expect(setFlashEnable).toHaveBeenCalled();
  });
});
