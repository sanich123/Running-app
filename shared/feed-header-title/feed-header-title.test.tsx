import { render, screen, userEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { ROUTES } from '@const/enums';
import { FEED_HEADER_BRAND } from './const';
import FeedHeaderTitle from './feed-header-title';

const mockReplace = jest.fn();
const mockCanGoBack = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ canGoBack: mockCanGoBack, replace: mockReplace }) }));

describe('FeedHeaderTitle', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    mockCanGoBack.mockReturnValue(true);
  });

  it('renders a plain title on native platforms', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });

    await render(<FeedHeaderTitle>Feed</FeedHeaderTitle>);

    expect(screen.getByText('Feed')).toBeOnTheScreen();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it('shows the current page title whenever the router can go back', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    const user = userEvent.setup();

    await render(<FeedHeaderTitle>Feed</FeedHeaderTitle>);
    await user.press(screen.getByText('Feed'));

    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.queryByLabelText(FEED_HEADER_BRAND.accessibilityLabel)).not.toBeOnTheScreen();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it('shows a Runich root link when the router has no back route', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    mockCanGoBack.mockReturnValue(false);
    const user = userEvent.setup();

    await render(<FeedHeaderTitle>Settings</FeedHeaderTitle>);
    await user.press(screen.getByLabelText(FEED_HEADER_BRAND.accessibilityLabel));

    expect(screen.getByText(FEED_HEADER_BRAND.title)).toBeOnTheScreen();
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.root);
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it('keeps the Runich brand visible on the home page when navigation can go back', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });

    await render(<FeedHeaderTitle isBrand>Home</FeedHeaderTitle>);

    expect(mockCanGoBack).toHaveBeenCalled();
    expect(screen.getByText(FEED_HEADER_BRAND.title)).toBeOnTheScreen();
    expect(screen.getByLabelText(FEED_HEADER_BRAND.accessibilityLabel)).toBeOnTheScreen();
    expect(mockReplace).not.toHaveBeenCalled();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });
});
