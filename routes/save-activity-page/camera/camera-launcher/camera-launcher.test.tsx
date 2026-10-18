import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import CameraLauncher from './camera-launcher';

let mockPermission: { granted: boolean } | null = null;
const mockRequestPermission = jest.fn(() => Promise.resolve({ granted: true }));
jest.mock('expo-camera', () => {
  const { View } = require('react-native');
  return {
    CameraView: (props: any) => <View testID="camera-view" {...props} />,
    useCameraPermissions: () => [mockPermission, mockRequestPermission],
  };
});
describe('camera', () => {
  beforeEach(() => {
    mockPermission = null;
    mockRequestPermission.mockClear();
  });

  it('shows a permission loader while camera permission is being resolved', async () => {
    await renderWithProviders(<CameraLauncher />);
    expect(screen.getByText('Подготавливаем камеру…')).toBeOnTheScreen();
  });

  it('shows the camera controls after permission is granted', async () => {
    mockPermission = { granted: true };
    await renderWithProviders(<CameraLauncher />);
    expect(screen.getByTestId('camera-view')).toBeOnTheScreen();
    expect(mockRequestPermission).toHaveBeenCalled();
  });
});
