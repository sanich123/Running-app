import { render, screen, userEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { ROUTES } from '@const/enums';
import FeedHeaderTitle from './feed-header-title';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }));

describe('FeedHeaderTitle', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a plain title on native platforms', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });

    await render(<FeedHeaderTitle>Feed</FeedHeaderTitle>);

    expect(screen.getByText('Feed')).toBeOnTheScreen();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it('links back to the root on web', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    const user = userEvent.setup();

    await render(<FeedHeaderTitle>Feed</FeedHeaderTitle>);
    await user.press(screen.getByText('Feed'));

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.root);
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });
});
