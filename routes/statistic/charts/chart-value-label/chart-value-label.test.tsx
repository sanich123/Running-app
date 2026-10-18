import { render } from '@testing-library/react-native';
import ChartValueLabel from './chart-value-label';

describe('chart value label', () => {
  it('renders the supplied chart value', async () => {
    const { getByText } = await render(ChartValueLabel('42'));
    expect(getByText('42')).toBeOnTheScreen();
  });
});
