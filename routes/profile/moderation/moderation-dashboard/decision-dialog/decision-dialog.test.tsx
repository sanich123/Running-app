import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { MODERATION_DASHBOARD_COPY } from '../../const';
import DecisionDialog from './decision-dialog';

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

  it('shows a deletion warning and confirms without asking for a note', async () => {
    const user = userEvent.setup();
    const copy = MODERATION_DASHBOARD_COPY[LANGUAGES.english];
    const onConfirm = jest.fn();
    await renderWithProviders(
      <DecisionDialog
        pendingDecision={{ kind: 'delete-report', reportId: 'report-1' }}
        isSaving={false}
        decisionNote=""
        onDecisionNoteChange={jest.fn()}
        suspensionDays="7"
        onSuspensionDaysChange={jest.fn()}
        language={LANGUAGES.english}
        copy={copy}
        onDismiss={jest.fn()}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText(copy.deleteReportWarning)).toBeOnTheScreen();
    const confirmButton = screen.getByRole('button', { name: copy.deleteReportConfirm });
    expect(confirmButton).toBeOnTheScreen();
    expect(screen.queryByTestId('moderation-decision-note')).toBeNull();
    expect(screen.queryByTestId('moderation-suspension-days')).toBeNull();
    await user.press(confirmButton);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
