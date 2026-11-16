import { render, screen } from '@testing-library/react-native';
import SubscriptionStatusRuntime from './subscription-status-runtime.web';

const mockWebAuthState = { auth: { userId: null as string | null } };

jest.mock('@R/typed-hooks', () => ({
  useAppSelector: (selector: (state: typeof mockWebAuthState) => unknown) => selector(mockWebAuthState),
}));

jest.mock('@Routes/subscription/subscription-status-sync/subscription-status-sync', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View testID="web-subscription-status-sync" /> };
});

describe('WebSubscriptionStatusRuntime', () => {
  it('does not load the synchronization runtime for a signed-out user', async () => {
    await render(<SubscriptionStatusRuntime />);
    expect(screen.queryByTestId('web-subscription-status-sync')).toBeNull();
  });
});
