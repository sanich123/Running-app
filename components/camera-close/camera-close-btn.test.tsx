import { screen, userEvent } from '@testing-library/react-native';

import CameraCloseBtn from './camera-close-btn';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Camera close btn', () => {
  it('should correctly renders and change global store', async () => {
    renderWithProviders(<CameraCloseBtn />, { store: mockStore });
    const cameraCloseBtn = screen.getByTestId('cameraCloseBtn');
    expect(cameraCloseBtn).toBeOnTheScreen();
    await userEvent.press(cameraCloseBtn);
    expect(mockStore.getState().activity.isCameraVisible).toEqual(false);
  });
});
