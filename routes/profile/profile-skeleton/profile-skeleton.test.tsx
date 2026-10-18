import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import ProfileSkeleton from './profile-skeleton';

describe('ProfileSkeleton', () => {
  it('renders the profile loading placeholders', async () => {
    await renderWithProviders(<ProfileSkeleton />);

    expect(screen.getByTestId('profile-page-skeleton')).toBeOnTheScreen();
    expect(screen.getByTestId('profile-skeleton-name')).toBeOnTheScreen();
    expect(screen.getByTestId('profile-skeleton-statistics')).toBeOnTheScreen();
  });
});
