import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import ViewWithIcon from './view-with-icon';

describe('ViewWithIcon', () => {
  it('shows its title and supporting description', async () => {
    await renderWithProviders(<ViewWithIcon icon="stethoscope" title="Health" subtitle="Connected" />);

    expect(screen.getByText('Health')).toBeOnTheScreen();
    expect(screen.getByText('Connected')).toBeOnTheScreen();
  });
});
