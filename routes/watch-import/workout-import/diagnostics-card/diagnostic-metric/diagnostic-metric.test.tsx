import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import DiagnosticMetric from './diagnostic-metric';

describe('DiagnosticMetric', () => {
  it('displays a status for a diagnostic check', async () => {
    await renderWithProviders(<DiagnosticMetric isRussian label="Account" status />);

    expect(screen.getByText('Account')).toBeOnTheScreen();
    expect(screen.getByTestId('diagnostic-metric-status')).toBeOnTheScreen();
  });
});
