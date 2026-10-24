import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { ROUTES } from '@const/enums';
import { useGetAdminAccessQuery } from '@R/services/admin/admin';
import { useAppSelector } from '@R/typed-hooks';
import ChangeTheme from './change-theme/change-theme';
import { SETTINGS } from './const';
import DeleteAccountBtn from './delete-account/delete-account-btn/delete-account-btn';
import FeedbackBtn from './feedback-btn/feedback-btn';
import LanguageSwitcher from './language-switcher/language-switcher';
import LegalInformation from './legal-information/legal-information';
import LogoutBtn from './logout/logout-btn/logout-btn';
import MigrationBtn from './migration-btn/migration-btn';
import SettingsRow from './settings-row/settings-row';

export default function SettingsPage() {
  const { colors } = useTheme();
  const { push } = useRouter();
  const { width } = useWindowDimensions();
  const { language } = useAppSelector(({ settings }) => settings);
  const labels = SETTINGS[language];
  const { data: adminAccess } = useGetAdminAccessQuery(undefined, { refetchOnMountOrArgChange: true });
  const deviceName =
    [Device.manufacturer, Device.modelName].filter((value): value is string => Boolean(value)).join(' ') ||
    (Platform.OS === 'web' ? labels.webBrowser : labels.unknown);
  const operatingSystem =
    [Device.osName, Device.osVersion].filter((value): value is string => Boolean(value)).join(' ') || labels.unknown;
  const applicationVersion = Constants.expoConfig?.version ?? labels.unknown;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      testID="settings-page-scroll"
      contentContainerStyle={{
        padding: 12,
        paddingBottom: Platform.OS === 'web' ? 40 : 12,
        gap: 8,
        backgroundColor: colors.background,
        width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
        marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
      }}>
      <LanguageSwitcher />
      <ChangeTheme />
      <MigrationBtn />
      <FeedbackBtn />
      {adminAccess && adminAccess.permissions.length > 0 ? (
        <SettingsRow
          testID="admin-panel-settings-row"
          icon="flag-outline"
          title={labels.adminPanel}
          description={labels.adminPanelDescription}
          onPress={() => push(`/${ROUTES.admin}`)}
        />
      ) : null}
      <LogoutBtn />
      <DeleteAccountBtn />
      <LegalInformation />
      <SettingsRow
        icon="information-outline"
        title={labels.aboutApp}
        description={`${labels.appVersion}: ${applicationVersion}\n${labels.device}: ${deviceName}\n${labels.operatingSystem}: ${operatingSystem}`}
      />
    </ScrollView>
  );
}
