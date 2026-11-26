import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { REPORT_CONTENT_COPY } from '../../report-content-dialog/const';
import { USER_SAFETY_MENU_COPY } from '../const';
import UserSafetyDialogs from './user-safety-dialogs';

const copy = USER_SAFETY_MENU_COPY[LANGUAGES.russian];

describe('UserSafetyDialogs', () => {
  it('opens and dismisses the user report dialog', async () => {
    const user = userEvent.setup();
    const onReportDismiss = jest.fn();

    await renderWithProviders(
      <UserSafetyDialogs
        userId="reported-user"
        copy={copy}
        isReportVisible
        isBlockConfirmationVisible={false}
        isLoading={false}
        onReportDismiss={onReportDismiss}
        onBlockDismiss={jest.fn()}
        onBlockConfirm={jest.fn()}
      />,
    );

    expect(screen.getByText(REPORT_CONTENT_COPY[LANGUAGES.russian].title)).toBeOnTheScreen();
    await user.press(screen.getByText(REPORT_CONTENT_COPY[LANGUAGES.russian].cancel));
    expect(onReportDismiss).toHaveBeenCalledTimes(1);
  });

  it('shows and dismisses the block confirmation', async () => {
    const user = userEvent.setup();
    const onBlockDismiss = jest.fn();

    await renderWithProviders(
      <UserSafetyDialogs
        userId="blocked-user"
        copy={copy}
        isReportVisible={false}
        isBlockConfirmationVisible
        isLoading={false}
        onReportDismiss={jest.fn()}
        onBlockDismiss={onBlockDismiss}
        onBlockConfirm={jest.fn()}
      />,
    );

    expect(screen.getByText(copy.blockTitle)).toBeOnTheScreen();
    await user.press(screen.getByTestId('confirm-dialog-cancel-button'));
    expect(onBlockDismiss).toHaveBeenCalledTimes(1);
  });
});
