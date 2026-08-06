import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import FullPageActivityLoader from './full-page-activity-loader';

describe('FullPageActivityLoader', () => {
  it('renders an activity indicator', async () => {
    await renderWithProviders(<FullPageActivityLoader />);
    expect(screen.getByTestId('full-page-activity-loader')).toBeOnTheScreen();
  });
});
