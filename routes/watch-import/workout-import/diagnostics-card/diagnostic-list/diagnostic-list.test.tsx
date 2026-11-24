import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import { WORKOUT_IMPORT_COPY } from '../../const';
import DiagnosticList from './diagnostic-list';

describe('DiagnosticList', () => {
  it('shows each diagnostic label and value', async () => {
    await renderWithProviders(<DiagnosticList items={[{ label: 'Platform', value: 'Android' }]} />);

    expect(screen.getByText(WORKOUT_IMPORT_COPY.en.diagnostics.platform)).toBeOnTheScreen();
    expect(screen.getByText('Android')).toBeOnTheScreen();
  });
});
