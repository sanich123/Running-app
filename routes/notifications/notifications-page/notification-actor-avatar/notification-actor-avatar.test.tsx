import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import NotificationActorAvatar from './notification-actor-avatar';

describe('NotificationActorAvatar', () => {
  it('shows the actor label when there is no photo', async () => {
    const actorLabel = 'AR';
    await renderWithProviders(<NotificationActorAvatar photo={null} label={actorLabel} testID="actor-avatar" />);

    expect(screen.getByText(actorLabel)).toBeOnTheScreen();
  });
});
