import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen, userEvent } from '@testing-library/react-native';

import CloseBtn from './close-btn';

describe('Camera close btn', () => {
  it('should correctly renders and change global store', async () => {
    renderWithProviders(<CloseBtn />, { store: mockStore });
    const closeBtn = screen.getByTestId('CloseBtn');
    expect(closeBtn).toBeOnTheScreen();
    await userEvent.press(closeBtn);
    expect(mockStore.getState().activity.isCameraVisible).toEqual(false);
  });
});
