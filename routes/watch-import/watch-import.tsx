import { Image, Linking, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import { errorToast } from '@S/error-toast/error-toast';
import {
  APP_GALLERY_INSTALL_URL,
  APP_GALLERY_URL,
  HEALTH_CONNECT_GUIDE_URL,
  HEALTH_CONNECT_PLAY_STORE_URL,
  HEALTH_SYNC_APP_GALLERY_URL,
  HEALTH_SYNC_CONFIG_SCREENSHOT_URL,
  HEALTH_SYNC_FAQ_URL,
  HEALTH_SYNC_GUIDE_URL,
  HEALTH_SYNC_SOURCE_SCREENSHOT_URL,
  HMS_CORE_GUIDE_URL,
  STRAVA_ANDROID_SUPPORT_URL,
  STRAVA_COUNTRY_SUPPORT_URL,
  STRAVA_DEVICE_COMPATIBILITY_URL,
  STRAVA_SIGN_UP_URL,
  STRAVA_XAPK_URL,
  XAPK_INSTALL_GUIDE_URL,
} from './const';

export default function WatchImportPage() {
  const { colors } = useTheme();
  const { push } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const isRussian = language === LANGUAGES.russian;
  const title = isRussian ? 'Подключение часов' : 'Connect a watch';

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      errorToast('', error);
    }
  };

  const openRunichImport = () => push('/watch-import/guide' as Parameters<typeof push>[0]);

  return (
    <>
      <Stack.Screen options={{ title }} />
      <CrossPlatformLayout scrollViewEnabled outerStyles={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          {title}
        </Text>

        <>
          <Card style={[styles.warningCard, { backgroundColor: colors.errorContainer }]}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: colors.onErrorContainer }}>
                {isRussian ? 'Предупреждение: настройка непростая' : 'Warning: setup takes several steps'}
              </Text>
              <Text variant="bodyMedium" style={{ color: colors.onErrorContainer }}>
                {isRussian
                  ? 'Понадобится связать несколько приложений и отдельно выдать им разрешения. Strava также сообщает об ограничениях доступа и синхронизации в России, поэтому этот способ может не сработать даже после установки.'
                  : 'You will need to connect several apps and grant permissions to each one. Strava also reports access and sync restrictions in Russia, so this route may fail even after installation.'}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.flowCard}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                {isRussian ? 'Как идут данные' : 'How the data moves'}
              </Text>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                {isRussian
                  ? 'Часы → приложение производителя → Strava → Health Sync → Health Connect → Runich'
                  : 'Watch → manufacturer app → Strava → Health Sync → Health Connect → Runich'}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.stepCard}>
            <Card.Content>
              <View style={styles.stepHeading}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primaryContainer }]}>
                  <Text variant="titleMedium" style={{ color: colors.primary }}>
                    1
                  </Text>
                </View>
                <Text variant="titleMedium" style={styles.stepTitle}>
                  {isRussian ? 'Свяжите приложение часов со Strava' : 'Connect the watch app to Strava'}
                </Text>
              </View>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                {isRussian
                  ? 'В приложении, связанном с часами, откройте подключённые сервисы или интеграции и выберите Strava. Войдите в аккаунт и подтвердите доступ. Названия разделов и поддержка автоматической передачи зависят от производителя и модели часов. Дождитесь, когда новая тренировка появится в Strava.'
                  : 'In the app paired with your watch, open connected services or integrations and choose Strava. Sign in and authorize access. Menu names and automatic sync support vary by manufacturer and watch model. Wait for a new workout to appear in Strava.'}
              </Text>
              <Button compact mode="outlined" onPress={() => void openLink(STRAVA_DEVICE_COMPATIBILITY_URL)}>
                {isRussian ? 'Совместимые часы и приложения' : 'Compatible watches and apps'}
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.stepCard}>
            <Card.Content>
              <View style={styles.stepHeading}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primaryContainer }]}>
                  <Text variant="titleMedium" style={{ color: colors.primary }}>
                    2
                  </Text>
                </View>
                <Text variant="titleMedium" style={styles.stepTitle}>
                  {isRussian ? 'Установите Strava и войдите в аккаунт' : 'Install Strava and sign in'}
                </Text>
              </View>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                {isRussian
                  ? 'Если аккаунта ещё нет, его можно попробовать создать на сайте Strava. Если Strava не удаётся скачать из Google Play в России, можно загрузить XAPK из стороннего каталога. Выберите актуальную совместимую версию и установите её через XAPK-установщик. XAPK содержит несколько частей приложения, поэтому стандартная кнопка «Установить» Android его не откроет. Разрешение на установку из выбранного источника включайте только по запросу установщика и после установки отключите.'
                  : 'If you do not have an account, you can try creating one on Strava’s website. If Strava is unavailable in Google Play in Russia, you can download its XAPK from a third-party catalog. Choose a current compatible version and install it with an XAPK installer. XAPK contains multiple app parts, so Android’s standard installer cannot open it directly. Enable installation from that source only when prompted, then turn the permission off afterward.'}
              </Text>
              <Text variant="bodySmall" style={[styles.inlineNote, { color: colors.error }]}>
                {isRussian
                  ? 'Установка файла не снимает региональные ограничения Strava. Strava требует версию 466 или новее и сервисы Google Play; проверьте требования Android для выбранного XAPK. Сама Strava предупреждает о возможных проблемах с доступом и синхронизацией в России.'
                  : 'Installing the file does not remove Strava’s regional restrictions. Strava requires version 466 or later and Google Play services; check the Android requirements for the XAPK you choose. Strava warns that access and syncing may be disrupted in Russia.'}
              </Text>
              <View style={styles.buttonStack}>
                <Button compact mode="outlined" onPress={() => void openLink(STRAVA_SIGN_UP_URL)}>
                  {isRussian ? 'Создать аккаунт Strava' : 'Create a Strava account'}
                </Button>
                <Button compact mode="outlined" onPress={() => void openLink(STRAVA_XAPK_URL)}>
                  {isRussian ? 'Страница Strava с XAPK' : 'Strava XAPK download page'}
                </Button>
                <Button compact mode="text" onPress={() => void openLink(XAPK_INSTALL_GUIDE_URL)}>
                  {isRussian ? 'Как установить XAPK' : 'How to install XAPK'}
                </Button>
                <Button compact mode="text" onPress={() => void openLink(STRAVA_COUNTRY_SUPPORT_URL)}>
                  {isRussian ? 'Ограничения Strava по странам' : 'Strava country restrictions'}
                </Button>
                <Button compact mode="text" onPress={() => void openLink(STRAVA_ANDROID_SUPPORT_URL)}>
                  {isRussian ? 'Требования Strava к Android' : 'Strava Android requirements'}
                </Button>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.stepCard}>
            <Card.Content>
              <View style={styles.stepHeading}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primaryContainer }]}>
                  <Text variant="titleMedium" style={{ color: colors.primary }}>
                    3
                  </Text>
                </View>
                <Text variant="titleMedium" style={styles.stepTitle}>
                  {isRussian ? 'Установите Health Sync через AppGallery' : 'Install Health Sync from AppGallery'}
                </Text>
              </View>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                {isRussian
                  ? 'Установите Huawei AppGallery, затем найдите в ней HMS Core и Health Sync. На телефоне Huawei HMS Core обычно уже установлен; на других телефонах установите или обновите его через AppGallery. В Health Sync выберите тип данных «Тренировки», Strava как источник и Health Connect как назначение, затем авторизуйте оба сервиса.'
                  : 'Install Huawei AppGallery, then find HMS Core and Health Sync in it. HMS Core is usually already installed on Huawei phones; on other phones, install or update it through AppGallery. In Health Sync, choose workout data, Strava as the source, and Health Connect as the destination, then authorize both services.'}
              </Text>
              <Text variant="bodySmall" style={[styles.inlineNote, { color: colors.onSurfaceVariant }]}>
                {isRussian
                  ? 'Health Sync предлагает пробный период, после него нужна лицензия. Разработчик описывает установку версии AppGallery и варианты оплаты для пользователей из России в своей справке.'
                  : 'Health Sync offers a trial period and then requires a license. Its help page describes the AppGallery version and payment options for users in Russia.'}
              </Text>
              <View style={styles.buttonStack}>
                <Button compact mode="outlined" onPress={() => void openLink(APP_GALLERY_INSTALL_URL)}>
                  {isRussian ? 'Установить Huawei AppGallery' : 'Install Huawei AppGallery'}
                </Button>
                <Button compact mode="outlined" onPress={() => void openLink(HEALTH_SYNC_APP_GALLERY_URL)}>
                  {isRussian ? 'Открыть Health Sync в AppGallery' : 'Open Health Sync in AppGallery'}
                </Button>
                <Button compact mode="outlined" onPress={() => void openLink(APP_GALLERY_URL)}>
                  {isRussian ? 'Найти HMS Core в AppGallery' : 'Find HMS Core in AppGallery'}
                </Button>
                <Button compact mode="text" onPress={() => void openLink(HMS_CORE_GUIDE_URL)}>
                  {isRussian ? 'Инструкция Huawei по HMS Core' : 'Huawei HMS Core instructions'}
                </Button>
                <Button compact mode="text" onPress={() => void openLink(HEALTH_SYNC_FAQ_URL)}>
                  {isRussian ? 'Справка Health Sync и оплата' : 'Health Sync help and license'}
                </Button>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.screenshotsCard}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                {isRussian ? 'Примеры экранов Health Sync' : 'Health Sync screen examples'}
              </Text>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                {isRussian
                  ? 'Это скриншоты из справки разработчика. Интерфейс приложения мог измениться; в актуальном меню выберите Strava источником, Health Connect назначением и включите синхронизацию тренировок.'
                  : 'These screenshots come from the developer’s help pages. The app interface may have changed; in the current menu choose Strava as source, Health Connect as destination, and enable workout syncing.'}
              </Text>
              <Image
                source={{ uri: HEALTH_SYNC_SOURCE_SCREENSHOT_URL }}
                accessibilityLabel={
                  isRussian ? 'Экран выбора источника Health Sync' : 'Health Sync source selection screen'
                }
                resizeMode="contain"
                style={styles.screenshot}
              />
              <Image
                source={{ uri: HEALTH_SYNC_CONFIG_SCREENSHOT_URL }}
                accessibilityLabel={
                  isRussian ? 'Экран настройки синхронизации Health Sync' : 'Health Sync sync configuration screen'
                }
                resizeMode="contain"
                style={styles.screenshot}
              />
              <Button compact mode="text" onPress={() => void openLink(HEALTH_SYNC_GUIDE_URL)}>
                {isRussian ? 'Документация Health Sync' : 'Health Sync documentation'}
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.stepCard}>
            <Card.Content>
              <View style={styles.stepHeading}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primaryContainer }]}>
                  <Text variant="titleMedium" style={{ color: colors.primary }}>
                    4
                  </Text>
                </View>
                <Text variant="titleMedium" style={styles.stepTitle}>
                  {isRussian ? 'Откройте Health Connect и настройте доступ' : 'Open Health Connect and grant access'}
                </Text>
              </View>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                {isRussian
                  ? 'На Android 14 и новее найдите Health Connect в системных Настройках → Безопасность и конфиденциальность. На Android 13 и старше установите приложение из Google Play, затем откройте Настройки → Приложения → Health Connect → Открыть. В разделе «Разрешения приложений» разрешите Health Sync записывать данные тренировок и GPS-маршрут. Для Runich разрешите чтение всех запрошенных данных активности — тренировок, расстояния и шагов; доступ к маршруту подтвердите в отдельном запросе.'
                  : 'On Android 14 and later, find Health Connect in Settings → Security and privacy. On Android 13 and earlier, install it from Google Play, then open Settings → Apps → Health Connect → Open. Under App permissions, allow Health Sync to write workout data and GPS routes. Allow Runich to read all requested activity data—workouts, distance, and steps—and approve route access in its separate prompt.'}
              </Text>
              <Text variant="bodySmall" style={[styles.inlineNote, { color: colors.onSurfaceVariant }]}>
                {isRussian
                  ? 'Для импорта Runich нужны разрешения на данные тренировок и маршрута. Они выдаются отдельно для каждого приложения в Health Connect.'
                  : 'Runich needs permissions for workout and route data to import activities. Health Connect grants these separately for each app.'}
              </Text>
              <View style={styles.buttonStack}>
                <Button compact mode="outlined" onPress={() => void openLink(HEALTH_CONNECT_PLAY_STORE_URL)}>
                  {isRussian ? 'Открыть Health Connect в Google Play' : 'Open Health Connect in Google Play'}
                </Button>
                <Button compact mode="text" onPress={() => void openLink(HEALTH_CONNECT_GUIDE_URL)}>
                  {isRussian ? 'Как открыть и настроить Health Connect' : 'Health Connect setup guide'}
                </Button>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.stepCard}>
            <Card.Content>
              <View style={styles.stepHeading}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primaryContainer }]}>
                  <Text variant="titleMedium" style={{ color: colors.primary }}>
                    5
                  </Text>
                </View>
                <Text variant="titleMedium" style={styles.stepTitle}>
                  {isRussian ? 'Завершите подключение в Runich' : 'Finish setup in Runich'}
                </Text>
              </View>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                {isRussian
                  ? 'Сначала убедитесь, что новая тренировка прошла по всей цепочке и появилась в Health Connect. Затем откройте импорт в Runich, разрешите доступ и выберите найденные тренировки. Runich проверяет записи за последние 30 дней. GPS-маршрут может не передаться — это зависит от данных Strava и разрешений Health Connect.'
                  : 'First confirm that a new workout passed through the full chain and appears in Health Connect. Then open Runich import, grant access, and select the workouts found. Runich checks records from the last 30 days. A GPS route may not transfer; this depends on Strava data and Health Connect permissions.'}
              </Text>
              <Button
                mode="contained"
                onPress={openRunichImport}
                style={styles.primaryButton}
                testID="watch-import-runich-action">
                {isRussian ? 'Перейти к импорту в Runich' : 'Continue to Runich import'}
              </Button>
            </Card.Content>
          </Card>
        </>
      </CrossPlatformLayout>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, gap: 10 },
  title: { marginBottom: 2 },
  warningCard: { marginTop: 2 },
  flowCard: { marginTop: 2 },
  stepCard: { marginTop: 2 },
  screenshotsCard: { marginTop: 2 },
  sectionTitle: { marginBottom: 6 },
  stepHeading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  stepNumber: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepTitle: { flex: 1 },
  inlineNote: { marginTop: 8 },
  buttonStack: { gap: 2, marginTop: 8 },
  primaryButton: { marginTop: 12 },
  screenshot: {
    width: '100%',
    height: 280,
    marginTop: 10,
    backgroundColor: 'rgba(127, 127, 127, 0.08)',
    borderRadius: 8,
  },
});
