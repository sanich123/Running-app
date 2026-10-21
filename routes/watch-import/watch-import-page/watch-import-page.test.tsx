import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { PROFILE_WATCH_IMPORT } from '../../profile/const';
import { WATCH_IMPORT_COPY } from '../const';
import type * as WatchImportModule from './watch-import-page';

const mockOpenExternalLink = jest.fn();
const mockRequestPermissions = jest.fn();
const mockGetPermissions = jest.fn();

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
}));
jest.mock('../utils', () => ({ openExternalLink: mockOpenExternalLink }));
jest.mock('../workout-import-content/workout-import-content', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../modules/runich-health/src/RunichHealth', () => ({
  RunichHealth: { getPermissions: mockGetPermissions, requestPermissions: mockRequestPermissions },
}));

const WatchImportPage = require('./watch-import-page').default as typeof WatchImportModule.default;

describe('WatchImportPage', () => {
  beforeEach(() => {
    mockOpenExternalLink.mockReset();
    mockGetPermissions.mockReset();
    mockRequestPermissions.mockReset();
    mockGetPermissions.mockResolvedValue({ available: true, granted: false });
    mockRequestPermissions.mockResolvedValue({ available: true, granted: true });
  });

  it('shows the experimental and revised setup copy', () => {
    const copy = WATCH_IMPORT_COPY.ru;

    expect(PROFILE_WATCH_IMPORT[LANGUAGES.russian].title).toBe('Подключить часы');
    expect(PROFILE_WATCH_IMPORT[LANGUAGES.russian].subtitle).toBe('(экспериментально)');
    expect(copy.warning.title).toBe('Предупреждение: настройка непростая и пока работает нестабильно');
    expect(copy.warning.description).toBe('Инструкция может быть неполной и будет изменяться.');
    expect(copy.steps.healthConnect.title).toBe('Настройте Runich');
    expect(copy.steps.healthConnect.actions.grantAccess).toBe('Дать доступ');
    expect(copy.steps.healthConnect.description).toBe(
      '1. Откройте Health Connect\n\n2. Дайте Runich все запрошенные разрешения в Health Connect.\n\n3. Также у Runich должно быть включено дополнительное разрешение на чтение маршрутов с режимом «Всегда».',
    );
    expect(copy.steps.healthSyncInstall.description).not.toContain('Для прямого варианта');
    expect(copy.steps.healthSyncInstall.description).toContain('синхронизацию тренировок из желаемого источника');
    expect(copy.steps.healthSyncInstall.description).toContain(
      'Не все приложения поддерживают выгрузку тренировки с маршрутами. Тестировалось на Strava и Suunto — они могут выгружать тренировки с маршрутами.',
    );
    expect(copy.steps.healthSyncInstall.description).toContain(
      'из которого будут выгружаться тренировки.\nНе все приложения поддерживают',
    );
    expect(copy.steps.healthSyncInstall.description).toContain(
      'Если Health Sync или приложение-источник позволяет отдельно настроить выгрузку пульса, включите её.',
    );
    expect(copy.steps.healthSyncInstall.description).toContain(
      'наличие самой тренировки не подтверждает, что пульс тоже выгрузился.',
    );
    expect(copy.steps.healthSyncInstall.description).not.toContain('Эта часть интуитивно понятна');
    expect(WATCH_IMPORT_COPY.en.steps.healthSyncInstall.description).toContain(
      'the workouts will be exported from.\nNot all apps support exporting workouts with routes.',
    );
    expect(WATCH_IMPORT_COPY.en.steps.healthSyncInstall.description).toContain(
      'If Health Sync or the source app offers a separate heart-rate export option, enable it too.',
    );
    expect(WATCH_IMPORT_COPY.en.steps.healthSyncInstall.description).toContain(
      'seeing the workout alone does not confirm that heart rate was exported.',
    );
    expect(WATCH_IMPORT_COPY.en.steps.healthSyncInstall.description).not.toContain('This part is intuitive');
    expect(copy.steps.healthSyncInstall.description).not.toContain('раз в 12 часов');
    expect(copy.steps.finish.title).toBe('Проверьте подключение Runich');
    expect(copy.screenshots.description).not.toContain('Для прямого варианта');
  });

  it('keeps setup steps collapsed and expands the selected step', async () => {
    const user = userEvent.setup();
    const copy = WATCH_IMPORT_COPY.ru;
    await renderWithProviders(<WatchImportPage />);

    const step = screen.getByLabelText(copy.steps.healthConnect.title);
    expect(screen.queryByRole('link', { name: 'Откройте Health Connect' })).not.toBeOnTheScreen();

    await user.press(step);
    expect(screen.getByRole('link', { name: 'Откройте Health Connect' })).toBeOnTheScreen();
    expect(screen.getByTestId('watch-import-health-connect-access')).toBeOnTheScreen();
    expect(screen.getByText(/Также у Runich должно быть включено дополнительное разрешение/)).toBeOnTheScreen();
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

  it('restores the granted state when Health Connect access already exists', async () => {
    const user = userEvent.setup();
    const copy = WATCH_IMPORT_COPY.ru;
    mockGetPermissions.mockResolvedValue({ available: true, granted: true });

    await renderWithProviders(<WatchImportPage />);
    await user.press(screen.getByLabelText(copy.steps.healthConnect.title));

    expect(await screen.findByText(copy.steps.healthConnect.actions.accessGranted)).toBeOnTheScreen();
    expect(screen.getByTestId('watch-import-health-connect-access').props.accessibilityState).toEqual({
      disabled: true,
    });
  });
});
