import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import CameraLauncher from './camera-launcher';
import type * as MockNativeViewTools from '@T/utils/mock-native-view';
import type { MockNativeViewProps } from '@T/utils/mock-native-view';

let mockPermission: { granted: boolean } | null = null;
const mockRequestPermission = jest.fn(() => Promise.resolve({ granted: true }));
jest.mock('expo-camera', () => {
  const { createMockNativeView } = require('@T/utils/mock-native-view') as typeof MockNativeViewTools;
  return {
    CameraView: (props: MockNativeViewProps) => createMockNativeView(props, undefined, 'camera-view'),
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
