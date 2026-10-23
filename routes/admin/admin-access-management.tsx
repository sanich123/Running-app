import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Checkbox, Divider, List, Text, TextInput, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import {
  useGetAdminAccessAuditQuery,
  useGetAdminUsersQuery,
  useGrantAdminRoleMutation,
  useRevokeAdminRoleMutation,
} from '@R/services/admin/admin';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import type { AdminRole, AdminUser } from '@R/services/admin/types';

const ROLE_ORDER: AdminRole[] = ['moderator', 'email_sender', 'access_manager', 'superuser'];

export default function AdminAccessManagement({ isSuperuser }: { isSuperuser: boolean }) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const userId = useAppSelector(({ auth }) => auth.userId);
  const [email, setEmail] = useState('');
  const [search, setSearch] = useState('');
  const usersQuery = useGetAdminUsersQuery({ ...(search ? { email: search } : {}), take: 50 });
  const auditQuery = useGetAdminAccessAuditQuery({ take: 30 });
  const [grantRole, grantState] = useGrantAdminRoleMutation();
  const [revokeRole, revokeState] = useRevokeAdminRoleMutation();
  const isSaving = grantState.isLoading || revokeState.isLoading;
  const copy =
    language === LANGUAGES.russian
      ? {
          title: 'Права пользователей',
          search: 'Найти пользователя по email',
          find: 'Найти',
          users: 'Пользователи',
          noUsers: 'Пользователи не найдены.',
          audit: 'История изменений прав',
          noAudit: 'Изменений пока нет.',
          roles: {
            moderator: 'Модерация контента',
            email_sender: 'Отправка email',
            access_manager: 'Управление правами',
            superuser: 'Суперпользователь',
          },
          granted: 'Право выдано.',
          revoked: 'Право отозвано.',
          error: 'Не удалось изменить права.',
          grant: 'Выдал',
          revoke: 'Отозвал',
        }
      : {
          title: 'User access',
          search: 'Find a user by email',
          find: 'Search',
          users: 'Users',
          noUsers: 'No users found.',
          audit: 'Access change history',
          noAudit: 'No changes yet.',
          roles: {
            moderator: 'Content moderation',
            email_sender: 'Send email',
            access_manager: 'Manage access',
            superuser: 'Superuser',
          },
          granted: 'Permission granted.',
          revoked: 'Permission revoked.',
          error: 'Could not change access.',
          grant: 'Granted by',
          revoke: 'Revoked by',
        };
  const roles = isSuperuser ? ROLE_ORDER : ROLE_ORDER.slice(0, 2);

  const toggleRole = async (user: AdminUser, role: AdminRole, enabled: boolean) => {
    try {
      if (enabled) {
        await grantRole({ userId: user.id, role }).unwrap();
        successToast(copy.granted);
      } else {
        await revokeRole({ userId: user.id, role }).unwrap();
        successToast(copy.revoked);
      }
      await Promise.all([usersQuery.refetch(), auditQuery.refetch()]);
    } catch (error) {
      errorToast(copy.error, error);
    }
  };

  const renderUser = (user: AdminUser) => (
    <View key={user.id}>
      <List.Item title={user.email} left={(props) => <List.Icon {...props} icon="account" />} />
      {roles.map((role) => {
        const isEnabled = user.roles.includes(role);
        const isSelf = user.id === userId;
        return (
          <View key={`${user.id}-${role}`} style={styles.roleRow}>
            <Checkbox
              status={isEnabled ? 'checked' : 'unchecked'}
              disabled={isSaving || isSelf}
              onPress={() => void toggleRole(user, role, !isEnabled)}
              testID={`admin-role-${role}-${user.id}`}
            />
            <Text style={{ color: colors.onSurface }}>{copy.roles[role]}</Text>
          </View>
        );
      })}
      <Divider />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={{ color: colors.onSurface }}>
        {copy.title}
      </Text>
      <View style={styles.searchRow}>
        <TextInput
          mode="outlined"
          dense
          style={styles.searchInput}
          label={copy.search}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          onSubmitEditing={() => setSearch(email.trim().toLowerCase())}
        />
        <Button mode="contained" onPress={() => setSearch(email.trim().toLowerCase())}>
          {copy.find}
        </Button>
      </View>
      {usersQuery.isLoading ? <ActivityIndicator style={styles.loader} testID="admin-users-loading" /> : null}
      {!usersQuery.isLoading && (usersQuery.data?.length ?? 0) === 0 ? <Text>{copy.noUsers}</Text> : null}
      {(usersQuery.data ?? []).map(renderUser)}
      <Text variant="titleMedium" style={{ color: colors.onSurface, marginTop: 12 }}>
        {copy.audit}
      </Text>
      {auditQuery.isLoading ? <ActivityIndicator style={styles.loader} testID="admin-audit-loading" /> : null}
      {!auditQuery.isLoading && (auditQuery.data?.length ?? 0) === 0 ? <Text>{copy.noAudit}</Text> : null}
      {(auditQuery.data ?? []).map((event) => (
        <List.Item
          key={event.id}
          title={`${copy.roles[event.role]} · ${event.targetEmail}`}
          description={`${event.action === 'granted' ? copy.grant : copy.revoke} ${event.actorEmail} · ${new Date(event.createdAt).toLocaleString(language === LANGUAGES.russian ? 'ru-RU' : 'en-US')}`}
          left={(props) => <List.Icon {...props} icon="history" />}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, paddingBottom: 24 },
  loader: { margin: 12 },
  roleRow: { alignItems: 'center', flexDirection: 'row', minHeight: 42, paddingLeft: 12 },
  searchInput: { flex: 1 },
  searchRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
});
