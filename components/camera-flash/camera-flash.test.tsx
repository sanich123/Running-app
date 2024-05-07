import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen, userEvent } from '@testing-library/react-native';

import CameraFlash from './camera-flash';

describe('Camera flash btn', () => {
  it('should correctly handle local state', async () => {
    const setFlashEnable = jest.fn();
    renderWithProviders(<CameraFlash setFlashEnable={setFlashEnable} flashEnable="off" />, {
      store: mockStore,
    });
    const flashBtn = screen.getByTestId('cameraFlashTestId');
    await userEvent.press(flashBtn);
    expect(setFlashEnable).toHaveBeenCalled();
  });
});
