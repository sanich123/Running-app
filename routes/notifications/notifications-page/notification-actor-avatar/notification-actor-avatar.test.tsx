import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import NotificationActorAvatar from './notification-actor-avatar';

describe('NotificationActorAvatar', () => {
  it('shows the actor label when there is no photo', async () => {
    const actorLabel = 'AR';
    await renderWithProviders(<NotificationActorAvatar photo={null} label={actorLabel} testID="actor-avatar" />);

    expect(screen.getByText(actorLabel)).toBeOnTheScreen();
  });

  it('shows the supplied moderation icon', async () => {
    await renderWithProviders(
      <NotificationActorAvatar photo={null} label="?" icon="flag-outline" testID="report-icon" />,
    );

    expect(screen.getByTestId('report-icon')).toBeOnTheScreen();
    expect(screen.queryByText('?')).toBeNull();
  });
});
