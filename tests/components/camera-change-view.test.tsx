import { screen, userEvent } from '@testing-library/react-native';
import { CameraType } from 'expo-camera';

import CameraChangeView from '../../components/camera-change-view/camera-change-view';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

describe('Camera change view', () => {
  it('should correctly handle local state', async () => {
    const setType = jest.fn();
    renderWithProviders(<CameraChangeView setType={setType} type={CameraType.front} />, {
      store: mockStore,
    });
    const changeViewBtn = screen.getByTestId('changeViewBtnTestId');
    await userEvent.press(changeViewBtn);
    expect(setType).toHaveBeenCalled();
  });
});
