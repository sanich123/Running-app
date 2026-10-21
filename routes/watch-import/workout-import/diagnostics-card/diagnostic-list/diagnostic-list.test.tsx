import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import DiagnosticList from './diagnostic-list';

describe('DiagnosticList', () => {
  it('shows each diagnostic label and value', async () => {
    await renderWithProviders(<DiagnosticList items={[{ label: 'Platform', value: 'Android' }]} />);

    expect(screen.getByText('Platform')).toBeOnTheScreen();
    expect(screen.getByText('Android')).toBeOnTheScreen();
  });
});
