import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import DecisionDialog from './decision-dialog';
import { MODERATION_DASHBOARD_COPY } from '../../const';

describe('DecisionDialog', () => {
  it('shows duration for temporary suspensions', async () => {
    const copy = MODERATION_DASHBOARD_COPY[LANGUAGES.english];
    await renderWithProviders(
      <DecisionDialog
        pendingDecision={{ kind: 'action', action: 'temporary_suspend' }}
        isSaving={false}
        decisionNote=""
        onDecisionNoteChange={jest.fn()}
        suspensionDays="7"
        onSuspensionDaysChange={jest.fn()}
        language={LANGUAGES.english}
        copy={copy}
        onDismiss={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.getByTestId('moderation-suspension-days')).toBeOnTheScreen();
    expect(screen.getByTestId('moderation-decision-note')).toBeOnTheScreen();
  });

  it('shows an appeal decision note without a suspension duration field', async () => {
    const copy = MODERATION_DASHBOARD_COPY[LANGUAGES.english];
    await renderWithProviders(
      <DecisionDialog
        pendingDecision={{ kind: 'appeal', appealId: 'appeal-1', decision: 'upheld' }}
        isSaving
        decisionNote=""
        onDecisionNoteChange={jest.fn()}
        suspensionDays="7"
        onSuspensionDaysChange={jest.fn()}
        language={LANGUAGES.english}
        copy={copy}
        onDismiss={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(await screen.findByTestId('moderation-decision-note')).toBeOnTheScreen();
    expect(screen.queryByTestId('moderation-suspension-days')).toBeNull();
  });
});
