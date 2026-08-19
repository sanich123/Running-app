import { screen, userEvent } from '@testing-library/react-native';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import CloseBtn from './close-btn';

const mockSetParams = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ cameraVisible: 'true' }),
  useRouter: () => ({ setParams: mockSetParams }),
}));

describe('Camera close btn', () => {
  it('should correctly renders and change global store', async () => {
    await renderWithProviders(<CloseBtn />, { store: mockStore });
    const closeBtn = screen.getByTestId('CloseBtn');
    expect(closeBtn).toBeOnTheScreen();
    await userEvent.press(closeBtn);
    expect(mockSetParams).toHaveBeenCalledWith({ cameraVisible: 'false' });
  });
});
