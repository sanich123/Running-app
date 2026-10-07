import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AppState, Linking, Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ActivityIndicator, Button, Card, Checkbox, Divider, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useImportWatchWorkoutsMutation } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import { errorToast } from '@S/error-toast/error-toast';
import { getWatchImportDateRange, mapWatchWorkoutToActivity } from '@U/watch-import/watch-import';
import { RunichHealth, type HealthAvailability, type WatchWorkout } from '../../modules/runich-health/src/RunichHealth';

function getWorkoutId(workout: WatchWorkout) {
  return `${workout.source}:${workout.sourceActivityId}`;
}

function getConnectionKey(userId: string | null) {
  return userId ? `runich.watch.connected.${userId}` : null;
}

const HEALTH_CONNECT_GUIDES = [
  {
    title: 'Suunto',
    description: {
      ru: 'Сначала синхронизируйте часы с Suunto App. Если в вашей версии приложения доступен Health Connect или раздел партнёрских сервисов, включите его там.',
      en: 'First sync your watch with Suunto App. If your app version provides Health Connect or partner services, enable it there.',
    },
    url: 'https://us.suunto.com/pages/getting-started-with-our-partner-ecosystem/',
  },
  {
    title: 'Garmin (Forerunner, fēnix, Venu)',
    description: {
      ru: 'Garmin Connect → Ещё → Настройки → Подключённые приложения → Health Connect. Интеграция Garmin доступна на Android 14 и новее.',
      en: 'Garmin Connect → More → Settings → Connected Apps → Health Connect. Garmin integration is available on Android 14 and newer.',
    },
    url: 'https://support.garmin.com/en-US/?faq=JToBEy0jfe6pIygark2Ui5',
  },
  {
    title: 'Xiaomi / Redmi (Watch, Band)',
    description: {
      ru: 'Mi Fitness → Профиль → Данные сторонних приложений → Health Connect → Подключить. Названия разделов могут немного отличаться по версии приложения.',
      en: 'Mi Fitness → Profile → Third-party data → Health Connect → Connect. Menu names can vary slightly by app version.',
    },
    url: 'https://www.mi.com/uk/support/faq/details/KA-728033/',
  },
  {
    title: 'Samsung Galaxy Watch',
    description: {
      ru: 'Samsung Health → Настройки → Health Connect. Включите передачу тренировок и нужных показателей.',
      en: 'Samsung Health → Settings → Health Connect. Enable exercise data and the metrics you want to share.',
    },
    url: 'https://developer.samsung.com/health/health-connect-faq.html',
  },
  {
    title: 'Polar',
    description: {
      ru: 'Polar Flow → Общие настройки → Health Connect → выберите данные → Разрешить.',
      en: 'Polar Flow → General settings → Health Connect → choose the data → Allow.',
    },
    url: 'https://support.polar.com/za/flow-app-health-connect',
  },
] as const;

export default function WatchImportPage() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const [availability, setAvailability] = useState<HealthAvailability | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [workouts, setWorkouts] = useState<WatchWorkout[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isReading, setIsReading] = useState(false);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [importWorkouts, { isLoading: isImporting }] = useImportWatchWorkoutsMutation();
  const isRussian = language === LANGUAGES.russian;

  const readWorkouts = useCallback(async (): Promise<WatchWorkout[]> => {
    setIsReading(true);
    setError(null);
    try {
      const { startDate, endDate } = getWatchImportDateRange();
      const result = await RunichHealth.readWorkouts(startDate, endDate);
      setWorkouts(result);
      setSelectedIds(new Set(result.map(getWorkoutId)));
      return result;
    } catch (readError) {
      setError(isRussian ? 'Не удалось получить тренировки из хранилища здоровья.' : 'Could not read workouts.');
      errorToast('', readError);
      return [];
    } finally {
      setIsReading(false);
    }
  }, [isRussian]);

  const syncLatestWorkouts = useCallback(
    async (autoImport: boolean) => {
      const result = await readWorkouts();
      if (!autoImport || !userId || result.length === 0) return;

      setIsAutoSyncing(true);
      try {
        const importResult = await importWorkouts({
          id: userId,
          workouts: result.map(mapWatchWorkoutToActivity),
        }).unwrap();
        setImportResult(
          isRussian
            ? `Автосинхронизация: новых тренировок ${importResult.imported}, уже были в Runich: ${importResult.skipped}.`
            : `Auto-sync: ${importResult.imported} new workouts, ${importResult.skipped} already in Runich.`,
        );
        setSelectedIds(new Set());
      } catch (importError) {
        setError(
          isRussian ? 'Не удалось автоматически сохранить тренировки в Runich.' : 'Auto-sync could not save workouts.',
        );
        errorToast('', importError);
      } finally {
        setIsAutoSyncing(false);
      }
    },
    [importWorkouts, isRussian, readWorkouts, userId],
  );

  useEffect(() => {
    let isMounted = true;
    const connectionKey = getConnectionKey(userId);
    const savedConnection = connectionKey ? SecureStore.getItemAsync(connectionKey) : Promise.resolve(null);
    void Promise.all([RunichHealth.getAvailability(), RunichHealth.getPermissions(), savedConnection])
      .then(([nextAvailability, permissions, savedConnectionValue]) => {
        if (!isMounted) return;
        setAvailability(nextAvailability);
        const connected = permissions.granted || savedConnectionValue === 'true';
        setIsConnected(connected);
        if (connected) void syncLatestWorkouts(true);
      })
      .catch((loadError) => {
        if (isMounted)
          setError(isRussian ? 'Не удалось проверить подключение часов.' : 'Could not check the watch connection.');
        errorToast('', loadError);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isRussian, syncLatestWorkouts, userId]);

  const previousAppState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const returnedToApp =
        previousAppState.current !== 'active' && nextAppState === 'active' && isConnected && Boolean(userId);
      previousAppState.current = nextAppState;
      if (returnedToApp) void syncLatestWorkouts(true);
    });

    return () => subscription.remove();
  }, [isConnected, syncLatestWorkouts, userId]);

  const selectedWorkouts = useMemo(
    () => workouts.filter((workout) => selectedIds.has(getWorkoutId(workout))),
    [selectedIds, workouts],
  );

  const steps =
    Platform.OS === 'ios'
      ? isRussian
        ? [
            {
              number: '1',
              title: 'Запишите тренировку на Apple Watch',
              description:
                'Завершите тренировку в приложении «Тренировка». После синхронизации она появится в Apple Health.',
            },
            {
              number: '2',
              title: 'Разрешите Runich читать Apple Health',
              description:
                'Нажмите кнопку ниже и включите доступ к тренировкам, маршрутам, расстоянию и шагам в системном окне.',
            },
            {
              number: '3',
              title: 'Проверьте список тренировок',
              description:
                'Runich загрузит завершённые записи за последние 30 дней. Вы сможете проверить их перед импортом.',
            },
            {
              number: '4',
              title: 'Импортируйте тренировку',
              description:
                'Выберите записи и нажмите «Импортировать». При следующем возвращении в Runich новые записи синхронизируются автоматически.',
            },
          ]
        : [
            {
              number: '1',
              title: 'Record a workout on Apple Watch',
              description: 'Finish a workout in the Workout app. After sync, it will appear in Apple Health.',
            },
            {
              number: '2',
              title: 'Allow Runich to read Apple Health',
              description: 'Tap the button below and allow workouts, routes, distance, and steps in the system dialog.',
            },
            {
              number: '3',
              title: 'Review your workouts',
              description:
                'Runich will load completed records from the last 30 days so you can review them before importing.',
            },
            {
              number: '4',
              title: 'Import the workout',
              description:
                'Select records and tap Import. When you return to Runich later, new records sync automatically.',
            },
          ]
      : isRussian
        ? [
            {
              number: '1',
              title: 'Синхронизируйте часы с Health Connect',
              description:
                'В приложении часов включите синхронизацию тренировок с Health Connect. Runich получает данные через него, а не напрямую из часов.',
            },
            {
              number: '2',
              title: 'Разрешите Runich читать Health Connect',
              description:
                'Нажмите кнопку ниже и разрешите тренировки, маршруты, расстояние и шаги в системном окне Health Connect.',
            },
            {
              number: '3',
              title: 'Проверьте список тренировок',
              description:
                'Runich загрузит завершённые записи за последние 30 дней. Вы сможете проверить их перед импортом.',
            },
            {
              number: '4',
              title: 'Импортируйте тренировку',
              description:
                'Выберите записи и нажмите «Импортировать». При следующем возвращении в Runich новые записи синхронизируются автоматически.',
            },
          ]
        : [
            {
              number: '1',
              title: 'Sync your watch with Health Connect',
              description:
                'In the watch companion app, enable workout sync to Health Connect. Runich reads through Health Connect, not directly from the watch.',
            },
            {
              number: '2',
              title: 'Allow Runich to read Health Connect',
              description:
                'Tap the button below and allow workouts, routes, distance, and steps in the Health Connect dialog.',
            },
            {
              number: '3',
              title: 'Review your workouts',
              description:
                'Runich will load completed records from the last 30 days so you can review them before importing.',
            },
            {
              number: '4',
              title: 'Import the workout',
              description:
                'Select records and tap Import. When you return to Runich later, new records sync automatically.',
            },
          ];

  const connect = async () => {
    setError(null);
    setImportResult(null);
    setIsLoading(true);
    try {
      const permissions = await RunichHealth.requestPermissions();
      setIsConnected(permissions.granted);
      if (!permissions.granted) {
        setError(isRussian ? 'Доступ к тренировкам не предоставлен.' : 'Workout access was not granted.');
        return;
      }
      const connectionKey = getConnectionKey(userId);
      if (connectionKey) {
        try {
          await SecureStore.setItemAsync(connectionKey, 'true');
        } catch {
          // The health connection itself does not depend on local marker storage.
        }
      }
      await readWorkouts();
    } catch (connectError) {
      setError(isRussian ? 'Не удалось подключить хранилище здоровья.' : 'Could not connect the health store.');
      errorToast('', connectError);
    } finally {
      setIsLoading(false);
    }
  };

  const openHealthConnectGuide = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (openError) {
      setError(isRussian ? 'Не удалось открыть инструкцию.' : 'Could not open the guide.');
      errorToast('', openError);
    }
  };

  const importSelected = async () => {
    if (!userId || selectedWorkouts.length === 0) return;
    setError(null);
    setImportResult(null);
    try {
      const result = await importWorkouts({
        id: userId,
        workouts: selectedWorkouts.map(mapWatchWorkoutToActivity),
      }).unwrap();
      setImportResult(
        isRussian
          ? `Импортировано: ${result.imported}. Пропущено как уже загруженные: ${result.skipped}.`
          : `Imported: ${result.imported}. Already imported: ${result.skipped}.`,
      );
      setSelectedIds(new Set());
    } catch (importError) {
      setError(isRussian ? 'Не удалось сохранить тренировки в Runich.' : 'Could not save workouts to Runich.');
      errorToast('', importError);
    }
  };

  const toggleWorkout = (workout: WatchWorkout) => {
    const id = getWorkoutId(workout);
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const title = isRussian ? 'Тренировки из часов' : 'Workouts from watch';
  const connectTitle = isRussian ? 'Разрешить доступ к тренировкам' : 'Allow workout access';

  return (
    <>
      <Stack.Screen options={{ title }} />
      <CrossPlatformLayout scrollViewEnabled outerStyles={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          {title}
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          {isRussian
            ? 'Runich получает тренировки через системное хранилище здоровья: Health Connect на Android или Apple Health на iPhone. Доступен импорт за последние 30 дней.'
            : 'Runich reads workouts saved by your watch companion app in Health Connect or Apple Health. The last 30 days are available for import.'}
        </Text>

        {Platform.OS === 'android' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">
                {isRussian ? 'Инструкции для приложения ваших часов' : 'Instructions for your watch app'}
              </Text>
              <Text variant="bodySmall" style={[styles.guideIntro, { color: colors.onSurfaceVariant }]}>
                {isRussian
                  ? 'Сначала включите передачу тренировок из приложения часов в Health Connect. Затем вернитесь в Runich и разрешите доступ к данным.'
                  : 'First enable workout sharing from your watch app to Health Connect. Then return to Runich and allow data access.'}
              </Text>
              <Button
                compact
                mode="text"
                onPress={() => void openHealthConnectGuide('https://support.google.com/android/answer/12201227?hl=en')}>
                {isRussian ? 'Общая инструкция Health Connect' : 'General Health Connect guide'}
              </Button>
              {HEALTH_CONNECT_GUIDES.map((guide) => (
                <View key={guide.title} style={styles.guideRow}>
                  <View style={styles.guideCopy}>
                    <Text variant="titleSmall">{guide.title}</Text>
                    <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                      {isRussian ? guide.description.ru : guide.description.en}
                    </Text>
                  </View>
                  <Button compact mode="outlined" onPress={() => void openHealthConnectGuide(guide.url)}>
                    {isRussian ? 'Открыть' : 'Open'}
                  </Button>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {steps.map((step) => (
          <Card key={step.number} style={styles.card}>
            <Card.Content>
              <View style={styles.stepRow}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primaryContainer }]}>
                  <Text variant="titleMedium" style={{ color: colors.primary }}>
                    {step.number}
                  </Text>
                </View>
                <View style={styles.stepCopy}>
                  <Text variant="titleMedium">{step.title}</Text>
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                    {step.description}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}

        {isLoading && !availability ? (
          <ActivityIndicator style={styles.loader} />
        ) : availability === 'provider-update-required' ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="bodyMedium">
                {isRussian
                  ? 'Обновите Health Connect через Google Play, затем вернитесь сюда и повторите подключение.'
                  : 'Update Health Connect through Google Play, then return here and connect again.'}
              </Text>
            </Card.Content>
          </Card>
        ) : availability === 'not-supported' || Platform.OS === 'web' ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="bodyMedium">
                {isRussian
                  ? 'Системное хранилище тренировок недоступно на этом устройстве.'
                  : 'The system workout store is not available on this device.'}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <>
            {!isConnected && (
              <Button mode="contained" onPress={connect} loading={isLoading} style={styles.button}>
                {connectTitle}
              </Button>
            )}

            {isConnected && (
              <Card style={styles.statusCard}>
                <Card.Content>
                  <Text variant="titleSmall" style={{ color: colors.primary }}>
                    {isRussian ? 'Хранилище подключено' : 'Health store connected'}
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                    {isRussian
                      ? 'После возвращения в Runich новые завершённые тренировки проверяются и отправляются автоматически. Повторные записи не создаются.'
                      : 'When you return to Runich, new completed workouts are checked and uploaded automatically. Existing records are skipped.'}
                  </Text>
                </Card.Content>
              </Card>
            )}

            {isConnected && (
              <Button
                mode="outlined"
                onPress={() => void syncLatestWorkouts(true)}
                loading={isReading || isAutoSyncing}
                style={styles.button}>
                {isRussian ? 'Обновить и синхронизировать' : 'Refresh and sync'}
              </Button>
            )}

            {error && <Text style={[styles.message, { color: colors.error }]}>{error}</Text>}
            {importResult && <Text style={[styles.message, { color: colors.primary }]}>{importResult}</Text>}

            {isReading ? (
              <ActivityIndicator style={styles.loader} />
            ) : workouts.length === 0 && isConnected ? (
              <Text style={[styles.message, { color: colors.onSurfaceVariant }]}>
                {isRussian
                  ? 'Завершённых тренировок за последние 30 дней нет.'
                  : 'No completed workouts in the last 30 days.'}
              </Text>
            ) : (
              workouts.map((workout, index) => {
                const id = getWorkoutId(workout);
                const checked = selectedIds.has(id);
                return (
                  <Card key={id} style={styles.card}>
                    <Card.Content>
                      <View style={styles.row}>
                        <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={() => toggleWorkout(workout)} />
                        <View style={styles.copy}>
                          <Text variant="titleMedium">{workout.title || workout.sport}</Text>
                          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                            {new Date(workout.date).toLocaleString(isRussian ? 'ru-RU' : 'en-US')} ·{' '}
                            {Math.round(workout.distance)} m · {Math.round(workout.duration / 60_000)} min
                          </Text>
                        </View>
                      </View>
                      {index < workouts.length - 1 && <Divider style={styles.divider} />}
                    </Card.Content>
                  </Card>
                );
              })
            )}

            {isConnected && workouts.length > 0 && (
              <Button
                mode="contained"
                onPress={() => void importSelected()}
                loading={isImporting}
                disabled={isImporting || selectedWorkouts.length === 0}
                style={styles.button}>
                {isRussian
                  ? `Импортировать выбранные (${selectedWorkouts.length})`
                  : `Import selected (${selectedWorkouts.length})`}
              </Button>
            )}
          </>
        )}
      </CrossPlatformLayout>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, gap: 10 },
  title: { marginBottom: 2 },
  card: { marginTop: 2 },
  statusCard: { marginTop: 2, borderColor: '#4caf50', borderWidth: 1 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNumber: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepCopy: { flex: 1, gap: 4 },
  guideIntro: { marginTop: 4 },
  guideRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  guideCopy: { flex: 1, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  copy: { flex: 1, gap: 2 },
  divider: { marginTop: 10 },
  button: { marginTop: 6 },
  message: { marginTop: 8 },
  loader: { marginVertical: 24 },
});
