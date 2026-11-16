import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useGetAdminAccessQuery } from '@R/services/admin/admin';
import { useAppSelector } from '@R/typed-hooks';
import ModerationDashboard from '@Routes/profile/moderation/moderation-dashboard';
import ErrorComponent from '@S/error-component/error-component';
import AdminAccessManagement from './admin-access-management/admin-access-management';
import AdminFeedback from './admin-feedback/admin-feedback';
import { ADMIN_DASHBOARD_COPY } from './const';

type AdminSection = 'moderation' | 'feedback' | 'access';

export default function AdminDashboard() {
  const { colors } = useTheme();
  const { replace } = useRouter();
  const { feedbackId } = useLocalSearchParams<{ feedbackId?: string }>();
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
  const [sectionSelection, setSectionSelection] = useState<{
    feedbackId: string | undefined;
    section: AdminSection;
  } | null>(null);
  const canModerate = access?.permissions.includes('moderation.manage') === true;
  const canManageFeedback = access?.permissions.includes('feedback.manage') === true;
  const canManageRoles = access?.permissions.includes('admin.roles.manage') === true;
  const hasPermissions = (access?.permissions.length ?? 0) > 0;
  const hasSelectedSection = canModerate || canManageFeedback || canManageRoles;
  const sections: AdminSection[] = [
    ...(canModerate ? ['moderation' as const] : []),
    ...(canManageFeedback ? ['feedback' as const] : []),
    ...(canManageRoles ? ['access' as const] : []),
  ];
  const activeSection =
    sectionSelection && sectionSelection.feedbackId === feedbackId
      ? sectionSelection.section
      : feedbackId && canManageFeedback
        ? 'feedback'
        : canModerate
          ? 'moderation'
          : canManageFeedback
            ? 'feedback'
            : 'access';
  const copy = ADMIN_DASHBOARD_COPY[language];

  useEffect(() => {
    if (!isLoading && access && !hasPermissions) {
      replace({
        pathname: `/${ROUTES.signIn}`,
        params: { returnTo: `/${ROUTES.admin}`, accessDenied: 'true' },
      });
    }
  }, [access, hasPermissions, isLoading, replace]);

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

  if (sections.length > 1) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SegmentedButtons
          value={activeSection}
          onValueChange={(value) => {
            const selectedSection = sections.find((section) => section === value);
            if (selectedSection) setSectionSelection({ feedbackId, section: selectedSection });
          }}
          buttons={sections.map((section) => ({
            value: section,
            label: copy[section],
            testID: `admin-section-${section}`,
          }))}
        />
        {activeSection === 'moderation' && canModerate ? <ModerationDashboard /> : null}
        {activeSection === 'feedback' && canManageFeedback ? (
          <AdminFeedback key={feedbackId ?? 'feedback-queue'} />
        ) : null}
        {activeSection === 'access' && canManageRoles ? (
          <AdminAccessManagement isSuperuser={access.isSuperuser} />
        ) : null}
      </View>
    );
  }

  if (canModerate) return <ModerationDashboard />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {canManageFeedback ? (
        <AdminFeedback key={feedbackId ?? 'feedback-queue'} />
      ) : (
        <AdminAccessManagement isSuperuser={access.isSuperuser} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'center', flex: 1, gap: 12, maxWidth: 1280, padding: 12, paddingBottom: 40, width: '100%' },
  loading: { padding: 24 },
  message: { alignSelf: 'center', padding: 24 },
});
