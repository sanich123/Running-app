import { Platform, ScrollView, useWindowDimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import ChangeTheme from './change-theme/change-theme';
import DeleteAccountBtn from './delete-account/delete-account';
import EmailNotificationsBtn from './email-notifications/email-notifications';
import FeedbackBtn from './feedback-btn/feedback-btn';
import LanguageSwitcher from './language-switcher/language-switcher';
import LegalInformation from './legal-information/legal-information';
import LogoutBtn from './logout/logout-btn';
import MigrationBtn from './migration-btn/migration-btn';

export default function SettingsPage() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        padding: 12,
        gap: 8,
        backgroundColor: colors.background,
        width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
        marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
      }}>
      <LanguageSwitcher />
      <ChangeTheme />
      <MigrationBtn />
      <EmailNotificationsBtn />
      <FeedbackBtn />
      <LogoutBtn />
      <DeleteAccountBtn />
      <LegalInformation />
    </ScrollView>
  );
}
