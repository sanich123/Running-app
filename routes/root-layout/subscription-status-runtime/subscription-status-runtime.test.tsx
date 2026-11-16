import { render, screen } from '@testing-library/react-native';
import SubscriptionStatusRuntime from './subscription-status-runtime';

jest.mock('@Routes/subscription/subscription-status-sync/subscription-status-sync', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View testID="subscription-status-sync" /> };
});

describe('SubscriptionStatusRuntime', () => {
  it('mounts the subscription synchronization runtime', async () => {
    await render(<SubscriptionStatusRuntime />);

    expect(screen.getByTestId('subscription-status-sync')).toBeOnTheScreen();
  });
});
