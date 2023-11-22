import { screen, userEvent } from '@testing-library/react-native';
import { FlashMode } from 'expo-camera';

import CameraFlash from './camera-flash';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Camera flash btn', () => {
  it('should correctly handle local state', async () => {
    const setFlashEnable = jest.fn();
    renderWithProviders(<CameraFlash setFlashEnable={setFlashEnable} flashEnable={FlashMode.off} />, {
      store: mockStore,
    });
    const flashBtn = screen.getByTestId('cameraFlashTestId');
    await userEvent.press(flashBtn);
    expect(setFlashEnable).toHaveBeenCalled();
  });
});
