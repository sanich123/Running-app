import { screen, userEvent } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { WATCH_IMPORT_COPY } from './const';
import type * as WatchImportModule from './watch-import';

const mockPush = jest.fn();
const mockOpenExternalLink = jest.fn();

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: mockPush }),
}));
jest.mock('./utils', () => ({ openExternalLink: mockOpenExternalLink }));

const WatchImportPage = require('./watch-import').default as typeof WatchImportModule.default;

describe('WatchImportPage', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockOpenExternalLink.mockReset();
  });

  it('keeps setup steps collapsed and expands the selected step', async () => {
    const user = userEvent.setup();
    const copy = WATCH_IMPORT_COPY.ru;
    await renderWithProviders(<WatchImportPage />);

    const step = screen.getByLabelText(copy.steps.stravaConnection.title);
    expect(screen.queryByText(copy.steps.stravaConnection.description)).not.toBeOnTheScreen();

    await user.press(step);
    expect(screen.getByText(copy.steps.stravaConnection.description)).toBeOnTheScreen();
  });

  it('opens the import guide from the final step', async () => {
    const user = userEvent.setup();
    const copy = WATCH_IMPORT_COPY.ru;
    await renderWithProviders(<WatchImportPage />);

    await user.press(screen.getByLabelText(copy.steps.finish.title));
    await user.press(screen.getByTestId('watch-import-runich-action'));

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.watchImport}/guide`);
  });

  it('routes external setup actions through the shared link handler', async () => {
    const user = userEvent.setup();
    const copy = WATCH_IMPORT_COPY.ru;
    await renderWithProviders(<WatchImportPage />);

    await user.press(screen.getByLabelText(copy.steps.healthSyncInstall.title));
    await user.press(screen.getByText(copy.steps.healthSyncInstall.actions.installAppGallery));

    expect(mockOpenExternalLink).toHaveBeenCalledWith(expect.any(String));
  });
});
