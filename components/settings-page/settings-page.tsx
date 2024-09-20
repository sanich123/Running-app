import { ScrollView } from 'react-native';
import LogoutBtn from './logout/logout-btn';
import EmailNotificationsBtn from './email-notifications/email-notifications';
import LanguageSwitcher from './language-switcher/language-switcher';
import DeleteAccountBtn from './delete-account/delete-account';
import PrefetchActivitiesBtn from './prefetch-activities-btn/prefetch-activities-btn';
import ClearCacheBtn from './clear-cache-btn/clear-cache-btn';
import MigrationBtn from './migration-btn/migration-btn';
import { useTheme } from 'react-native-paper';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import ChangeTheme from './change-theme/change-theme';

export default function SettingsPage() {
  const { colors } = useTheme();

  return (
    <ScrollView contentContainerStyle={{ flex: 1, backgroundColor: colors.background }}>
      <BottomSheetModalProvider>
        <LanguageSwitcher />
        <ClearCacheBtn />
        <PrefetchActivitiesBtn />
        <EmailNotificationsBtn />
        <LogoutBtn />
        <DeleteAccountBtn />
        <MigrationBtn />
        <ChangeTheme />
      </BottomSheetModalProvider>
    </ScrollView>
  );
}
