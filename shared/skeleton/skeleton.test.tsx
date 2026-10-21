import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import Skeleton from './skeleton';

describe('Skeleton', () => {
  it('renders its placeholder with the supplied test id and style', async () => {
    await renderWithProviders(<Skeleton testID="profile-name-placeholder" style={{ width: 120, height: 20 }} />);

    expect(screen.getByTestId('profile-name-placeholder')).toHaveStyle({ width: 120, height: 20 });
  });
});
