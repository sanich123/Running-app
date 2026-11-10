import { screen } from '@testing-library/react-native';
import { Text } from 'react-native-paper';
import { renderWithProviders } from '@T/utils/test-utils';
import DiagnosticsSection from './diagnostics-section';
import { WORKOUT_IMPORT_COPY } from '../../const';

describe('DiagnosticsSection', () => {
  it('renders the section label and its contents', async () => {
    await renderWithProviders(
      <DiagnosticsSection icon="connection" title="Connection">
        <Text>Ready</Text>
      </DiagnosticsSection>,
    );

    expect(screen.getByText(WORKOUT_IMPORT_COPY.en.diagnostics.sections.connection)).toBeOnTheScreen();
    expect(screen.getByText('Ready')).toBeOnTheScreen();
  });
});
