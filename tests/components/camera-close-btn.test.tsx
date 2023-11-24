import { screen, userEvent } from '@testing-library/react-native';

import CameraCloseBtn from '../../components/camera-close/camera-close-btn';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

describe('Camera close btn', () => {
  it('should correctly renders and change global store', async () => {
    renderWithProviders(<CameraCloseBtn />, { store: mockStore });
    const cameraCloseBtn = screen.getByTestId('cameraCloseBtn');
    expect(cameraCloseBtn).toBeOnTheScreen();
    await userEvent.press(cameraCloseBtn);
    expect(mockStore.getState().activity.isCameraVisible).toEqual(false);
  });
});
