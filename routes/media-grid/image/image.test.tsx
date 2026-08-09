import { screen, userEvent } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import MediaGridImage from './image';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'profile-id' }),
  useRouter: () => ({ push: mockPush }),
}));

describe('image', () => {
  it('opens the selected media with its index and current page size', async () => {
    const user = userEvent.setup();
    const url = 'https://images.example.test/grid.jpg';
    await renderWithProviders(<MediaGridImage url={url} thumbnail={null} index={3} take={28} />);
    await user.press(screen.getByTestId(url));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.media}/3?userId=profile-id&take=28`);
  });
});
