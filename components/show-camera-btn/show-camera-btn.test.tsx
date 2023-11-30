import { changeLanguage } from '@R/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen, userEvent } from '@testing-library/react-native';

import { SHOW_CAMERA_BTN } from './const';
import ShowCameraBtn from './show-camera-btn';

describe('Show camera btn', () => {
  it('should correctly renders in english', () => {
    renderWithProviders(<ShowCameraBtn isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(new RegExp(`${SHOW_CAMERA_BTN.english.text}`)));
  });
  it('should correctly renders in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<ShowCameraBtn isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(new RegExp(`${SHOW_CAMERA_BTN.russian.text}`)));
  });
  it('should correctly change global store', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<ShowCameraBtn isDisabled={false} />, { store: mockStore });
    const showCameraBtn = screen.getByText(new RegExp(`${SHOW_CAMERA_BTN.russian.text}`));
    await userEvent.press(showCameraBtn);
    expect(mockStore.getState().activity.isCameraVisible).toEqual(true);
  });
});
