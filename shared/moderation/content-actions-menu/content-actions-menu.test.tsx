import type { ComponentType } from 'react';
import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import type { ContentActionsMenuProps } from './types';

const PaperContentActionsMenu = require('./content-actions-menu.tsx').default as ComponentType<ContentActionsMenuProps>;

describe('ContentActionsMenu', () => {
  it('shows report and block actions and runs the selected callbacks', async () => {
    const user = userEvent.setup();
    const onReport = jest.fn();
    const onBlock = jest.fn();

    await renderWithProviders(
      <PaperContentActionsMenu
        accessibilityLabel="User actions"
        testID="content-actions-trigger"
        reportLabel="Report"
        reportTestID="content-actions-report"
        onReport={onReport}
        blockLabel="Block"
        blockTestID="content-actions-block"
        onBlock={onBlock}
      />,
    );

    await user.press(screen.getByTestId('content-actions-trigger'));
    await user.press(screen.getByTestId('content-actions-report'));
    expect(onReport).toHaveBeenCalledTimes(1);

    await user.press(screen.getByTestId('content-actions-trigger'));
    await user.press(screen.getByTestId('content-actions-block'));
    expect(onBlock).toHaveBeenCalledTimes(1);
  });

  it('omits block action when the menu is used for content', async () => {
    const user = userEvent.setup();
    await renderWithProviders(
      <PaperContentActionsMenu
        accessibilityLabel="Comment actions"
        testID="comment-actions-trigger"
        reportLabel="Report"
        reportTestID="comment-actions-report"
        onReport={jest.fn()}
      />,
    );

    await user.press(screen.getByTestId('comment-actions-trigger'));
    expect(screen.getByTestId('comment-actions-report')).toBeOnTheScreen();
    expect(screen.queryByTestId('content-actions-block')).toBeNull();
  });
});
