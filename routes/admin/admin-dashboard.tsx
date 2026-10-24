import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ActivityIndicator, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { LANGUAGES, ROUTES } from '@const/enums';
import { useGetAdminAccessQuery } from '@R/services/admin/admin';
import { useAppSelector } from '@R/typed-hooks';
import ModerationDashboard from '@Routes/profile/moderation/moderation-dashboard';
import ErrorComponent from '@S/error-component/error-component';
import AdminAccessManagement from './admin-access-management/admin-access-management';

type AdminSection = 'moderation' | 'access';

export default function AdminDashboard() {
  const { colors } = useTheme();
  const { replace } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const {
    data: access,
    error,
    isError,
    isLoading,
    refetch,
  } = useGetAdminAccessQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [activeSection, setActiveSection] = useState<AdminSection>('moderation');
  const canModerate = access?.permissions.includes('moderation.manage') === true;
  const canManageRoles = access?.permissions.includes('admin.roles.manage') === true;
  const hasPermissions = (access?.permissions.length ?? 0) > 0;
  const hasSelectedSection = canModerate || canManageRoles;
  const copy =
    language === LANGUAGES.russian
      ? {
          loading: 'Проверяем права доступа…',
          moderation: 'Модерация',
          access: 'Права доступа',
          emailOnly: 'У вас есть право отправлять email. Этот раздел админки пока не подключён.',
        }
      : {
          loading: 'Checking access…',
          moderation: 'Moderation',
          access: 'Access rights',
          emailOnly: 'You can send email. This admin section is not connected yet.',
        };

  useEffect(() => {
    if (!isLoading && access && !hasPermissions) {
      replace({
        pathname: `/${ROUTES.signIn}`,
        params: { returnTo: `/${ROUTES.admin}`, accessDenied: 'true' },
      });
    }
  }, [access, hasPermissions, isLoading, replace]);

  useEffect(() => {
    if (canManageRoles && !canModerate) setActiveSection('access');
  }, [canManageRoles, canModerate]);

  if (isLoading || (!hasPermissions && !isError)) {
    return <ActivityIndicator size="large" style={styles.loading} testID="admin-access-loading" />;
  }

  if (isError) {
    return <ErrorComponent error={error} refetch={refetch} />;
  }

  if (!access || !hasPermissions) return null;

  if (!hasSelectedSection) {
    return <Text style={[styles.message, { color: colors.onSurfaceVariant }]}>{copy.emailOnly}</Text>;
  }

  if (canModerate && canManageRoles) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SegmentedButtons
          value={activeSection}
          onValueChange={(value) => setActiveSection(value as AdminSection)}
          buttons={[
            { value: 'moderation', label: copy.moderation, testID: 'admin-section-moderation' },
            { value: 'access', label: copy.access, testID: 'admin-section-access' },
          ]}
        />
        {activeSection === 'moderation' ? (
          <ModerationDashboard />
        ) : (
          <AdminAccessManagement isSuperuser={access.isSuperuser} />
        )}
      </View>
    );
  }

  return canModerate ? <ModerationDashboard /> : <AdminAccessManagement isSuperuser={access.isSuperuser} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12, padding: 12, paddingBottom: 40 },
  loading: { padding: 24 },
  message: { alignSelf: 'center', padding: 24 },
});
