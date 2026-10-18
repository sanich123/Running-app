import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import Metric from './metric';

describe('Metric', () => {
  it('shows the metric value and label', async () => {
    await renderWithProviders(<Metric label="Distance" value="12 km" />);

    expect(screen.getByText('12 km')).toBeOnTheScreen();
    expect(screen.getByText('Distance')).toBeOnTheScreen();
  });
});
