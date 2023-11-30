import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen, userEvent } from '@testing-library/react-native';

import CameraCloseBtn from './camera-close-btn';

describe('Camera close btn', () => {
  it('should correctly renders and change global store', async () => {
    renderWithProviders(<CameraCloseBtn />, { store: mockStore });
    const cameraCloseBtn = screen.getByTestId('cameraCloseBtn');
    expect(cameraCloseBtn).toBeOnTheScreen();
    await userEvent.press(cameraCloseBtn);
    expect(mockStore.getState().activity.isCameraVisible).toEqual(false);
  });
});
