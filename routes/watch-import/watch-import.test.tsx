import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES, ROUTES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { WATCH_IMPORT_COPY } from './const';
import { PROFILE_WATCH_IMPORT } from '../profile/const';
import type * as WatchImportModule from './watch-import';

const mockPush = jest.fn();
const mockOpenExternalLink = jest.fn();
const mockRequestPermissions = jest.fn();

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: mockPush }),
}));
jest.mock('./utils', () => ({ openExternalLink: mockOpenExternalLink }));
jest.mock('../../modules/runich-health/src/RunichHealth', () => ({
  RunichHealth: { requestPermissions: mockRequestPermissions },
}));

const WatchImportPage = require('./watch-import').default as typeof WatchImportModule.default;

describe('WatchImportPage', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockOpenExternalLink.mockReset();
    mockRequestPermissions.mockReset();
    mockRequestPermissions.mockResolvedValue({ available: true, granted: true });
  });

  it('shows the experimental and revised setup copy', () => {
    const copy = WATCH_IMPORT_COPY.ru;

    expect(PROFILE_WATCH_IMPORT[LANGUAGES.russian].title).toBe('Подключить часы');
    expect(PROFILE_WATCH_IMPORT[LANGUAGES.russian].subtitle).toBe('(экспериментально)');
    expect(copy.warning.title).toBe('Предупреждение: настройка непростая и пока работает нестабильно');
    expect(copy.warning.description).toBe('Инструкция может быть неполной и будет изменяться.');
    expect(copy.steps.stravaInstall.title).toBe('Strava: более проверенный вариант');
    expect(copy.steps.healthConnect.title).toBe('Настройте Runich в Health Connect');
    expect(copy.steps.healthConnect.actions.grantAccess).toBe('Дать доступ');
    expect(copy.steps.healthConnect.description).toContain('разрешите Runich все запрошенные разрешения');
    expect(copy.steps.stravaInstall.description).toMatch(/^Откройте приложение производителя часов/);
    expect(copy.steps.stravaInstall.description).toContain('Большинство популярных моделей часов');
    expect(copy.steps.stravaInstall.description.indexOf('Откройте приложение производителя часов')).toBeLessThan(
      copy.steps.stravaInstall.description.indexOf('Если аккаунта ещё нет'),
    );
    expect(copy.steps.stravaInstall.description).not.toContain('Выберите актуальную совместимую версию');
    expect(copy.steps.healthSyncInstall.description).not.toContain('Для прямого варианта');
    expect(copy.steps.healthSyncInstall.description).toContain('проверки раз в 12 часов');
    expect(copy.steps.healthSyncInstall.stabilityWarning).toBe(
      'Эта часть работает нестабильно. Health Sync то нормально синхронизирует тренировку из Strava, то без объяснения причин не делает этого. Иногда работает только выборочная синхронизация по дате.',
    );
    expect(copy.steps.finish.title).toBe('Проверьте подключение Runich');
    expect(copy.steps.finish.description).toContain('откроется диагностическая страница');
    expect(copy.steps.finish.description).toContain('какие тренировки найдены');
    expect(copy.steps.finish.description).toContain('какие разрешения выданы Runich');
    expect(copy.steps.finish.action).toBe('Открыть диагностическую страницу');
    expect(copy.screenshots.description).not.toContain('Для прямого варианта');
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

  it('requests Runich access from the Health Connect step', async () => {
    const user = userEvent.setup();
    const copy = WATCH_IMPORT_COPY.ru;
    await renderWithProviders(<WatchImportPage />);

    await user.press(screen.getByLabelText(copy.steps.healthConnect.title));
    await user.press(screen.getByTestId('watch-import-health-connect-access'));

    expect(mockRequestPermissions).toHaveBeenCalledTimes(1);
    expect(screen.getByText(copy.steps.healthConnect.actions.accessGranted)).toBeOnTheScreen();
  });
});
