import { Platform, ScrollView, useWindowDimensions } from 'react-native';
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
import { MAX_MOBILE_WIDTH } from '@const/const';

export default function SettingsPage() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        backgroundColor: colors.background,
        width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
        marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
      }}>
      <BottomSheetModalProvider>
        <LanguageSwitcher />
        {Platform.OS !== 'web' && <ChangeTheme />}
        <MigrationBtn />
        <ClearCacheBtn />
        <PrefetchActivitiesBtn />
        <EmailNotificationsBtn />
        <LogoutBtn />
        <DeleteAccountBtn />
      </BottomSheetModalProvider>
    </ScrollView>
  );
}
