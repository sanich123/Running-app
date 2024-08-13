import { ScrollView } from 'react-native';

import LogoutBtn from './logout/logout-btn';
import EmailNotificationsBtn from './email-notifications/email-notifications';
import LanguageSwitcher from './language-switcher/language-switcher';
import DeleteAccountBtn from './delete-account/delete-account';
import PrefetcActivitiesBtn from './prefetch-activities-btn/prefetch-activities-btn';
import ClearCacheBtn from './clear-cache-btn/clear-cache-btn';

export default function SettingsPage() {
  return (
    <ScrollView contentContainerStyle={{ padding: 10, display: 'flex', gap: 15 }}>
      <LanguageSwitcher />
      <ClearCacheBtn />
      <PrefetcActivitiesBtn />
      <EmailNotificationsBtn />
      <LogoutBtn />
      <DeleteAccountBtn />
    </ScrollView>
  );
}
