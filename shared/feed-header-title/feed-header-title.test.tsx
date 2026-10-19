import { render, screen, userEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { ROUTES } from '@const/enums';
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
    expect(screen.queryByLabelText('Runich')).not.toBeOnTheScreen();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it('shows a Runich root link when the router has no back route', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    mockCanGoBack.mockReturnValue(false);
    const user = userEvent.setup();

    await render(<FeedHeaderTitle>Settings</FeedHeaderTitle>);
    await user.press(screen.getByLabelText('Runich'));

    expect(screen.getByText('RUNICH')).toBeOnTheScreen();
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.root);
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it('keeps the Runich root link on the home page even when navigation can go back', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    const user = userEvent.setup();

    await render(<FeedHeaderTitle isBrand>Home</FeedHeaderTitle>);
    await user.press(screen.getByLabelText('Runich'));

    expect(mockCanGoBack).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.root);
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });
});
