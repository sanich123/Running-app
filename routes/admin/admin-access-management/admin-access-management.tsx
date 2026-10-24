import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Dialog,
  Divider,
  IconButton,
  List,
  Portal,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import {
  useGetAdminAccessAuditQuery,
  useGetAdminUsersQuery,
  useGrantAdminRoleMutation,
  useRevokeAdminRoleMutation,
} from '@R/services/admin/admin';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { RESPONSIVE_DIALOG_STYLE } from '@S/responsive-dialog-style';
import { successToast } from '@S/success-toast/success-toast';
import type { AdminRole, AdminUser } from '@R/services/admin/types';

const ROLE_ORDER: AdminRole[] = ['moderator', 'email_sender', 'access_manager', 'superuser'];

export default function AdminAccessManagement({ isSuperuser }: { isSuperuser: boolean }) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const [email, setEmail] = useState('');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [draftRoles, setDraftRoles] = useState<AdminRole[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const usersQuery = useGetAdminUsersQuery({ ...(search ? { email: search } : {}), take: 50 });
  const auditQuery = useGetAdminAccessAuditQuery({ take: 30 });
  const [grantRole] = useGrantAdminRoleMutation();
  const [revokeRole] = useRevokeAdminRoleMutation();
  const copy =
    language === LANGUAGES.russian
      ? {
          title: 'Права пользователей',
          search: 'Найти пользователя по email',
          find: 'Найти',
          clearSearch: 'Очистить поиск',
          noUsers: 'Пользователи не найдены.',
          noRoles: 'Нет назначенных прав',
          edit: 'Изменить права',
          dialogTitle: 'Права доступа',
          choosePermissions: 'Выберите права для пользователя',
          selfEditDisabled: 'Нельзя изменить собственные права.',
          save: 'Сохранить',
          cancel: 'Отмена',
          saved: 'Права сохранены.',
          loadError: 'Не удалось загрузить пользователей.',
          retry: 'Повторить',
          audit: 'История изменений прав',
          noAudit: 'Изменений пока нет.',
          roles: {
            moderator: 'Модерация контента',
            email_sender: 'Отправка email',
            access_manager: 'Управление правами',
            superuser: 'Суперпользователь',
          },
          error: 'Не удалось изменить права.',
          grant: 'Выдал',
          revoke: 'Отозвал',
        }
      : {
          title: 'User access',
          search: 'Find a user by email',
          find: 'Search',
          clearSearch: 'Clear search',
          noUsers: 'No users found.',
          noRoles: 'No assigned permissions',
          edit: 'Edit permissions',
          dialogTitle: 'Access rights',
          choosePermissions: 'Choose permissions for this user',
          selfEditDisabled: 'You cannot change your own permissions.',
          save: 'Save',
          cancel: 'Cancel',
          saved: 'Permissions saved.',
          loadError: 'Could not load users.',
          retry: 'Retry',
          audit: 'Access change history',
          noAudit: 'No changes yet.',
          roles: {
            moderator: 'Content moderation',
            email_sender: 'Send email',
            access_manager: 'Manage access',
            superuser: 'Superuser',
          },
          error: 'Could not change access.',
          grant: 'Granted by',
          revoke: 'Revoked by',
        };
  const roles = isSuperuser ? ROLE_ORDER : ROLE_ORDER.slice(0, 2);
  const users = usersQuery.currentData ?? [];
  const changedRoles = selectedUser
    ? roles.filter((role) => selectedUser.roles.includes(role) !== draftRoles.includes(role))
    : [];

  const applySearch = () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === search) {
      void usersQuery.refetch();
    } else {
      setSearch(normalizedEmail);
    }
  };

  const openEditor = (user: AdminUser) => {
    setSelectedUser(user);
    setDraftRoles(user.roles);
  };

  const closeEditor = () => {
    if (!isSaving) setSelectedUser(null);
  };

  const saveRoles = async () => {
    if (!selectedUser || changedRoles.length === 0) return;

    setIsSaving(true);
    try {
      for (const role of changedRoles) {
        if (draftRoles.includes(role)) {
          await grantRole({ userId: selectedUser.id, role }).unwrap();
        } else {
          await revokeRole({ userId: selectedUser.id, role }).unwrap();
        }
      }
      await Promise.all([usersQuery.refetch(), auditQuery.refetch()]);
      successToast(copy.saved);
      setSelectedUser(null);
    } catch (error) {
      errorToast(copy.error, error);
    } finally {
      setIsSaving(false);
    }
  };

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
          onSubmitEditing={applySearch}
          testID="admin-user-search"
        />
        <Button mode="contained" onPress={applySearch}>
          {copy.find}
        </Button>
      </View>
      {usersQuery.isFetching && !usersQuery.currentData ? (
        <ActivityIndicator style={styles.loader} testID="admin-users-loading" />
      ) : null}
      {usersQuery.isError ? (
        <View style={styles.errorState}>
          <Text style={{ color: colors.error }}>{copy.loadError}</Text>
          <Button mode="text" onPress={() => void usersQuery.refetch()}>
            {copy.retry}
          </Button>
        </View>
      ) : null}
      {!usersQuery.isFetching && !usersQuery.isError && users.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ color: colors.onSurfaceVariant }}>{copy.noUsers}</Text>
          {search ? (
            <Button
              mode="text"
              onPress={() => {
                setEmail('');
                setSearch('');
              }}>
              {copy.clearSearch}
            </Button>
          ) : null}
        </View>
      ) : null}
      {users.map((user) => {
        const isSelf = user.id === userId;
        const roleSummary = user.roles.map((role) => copy.roles[role]).join(' · ') || copy.noRoles;
        return (
          <View key={user.id} testID={`admin-user-${user.id}`}>
            <List.Item
              title={user.email}
              description={roleSummary}
              left={(props) => <List.Icon {...props} icon="account" />}
              right={() => (
                <IconButton
                  icon="pencil"
                  accessibilityLabel={`${copy.edit}: ${user.email}`}
                  disabled={isSelf}
                  onPress={() => openEditor(user)}
                  testID={`admin-edit-${user.id}`}
                />
              )}
              onPress={isSelf ? undefined : () => openEditor(user)}
            />
            <Divider />
          </View>
        );
      })}
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
      <Portal>
        <Dialog
          visible={Boolean(selectedUser)}
          onDismiss={closeEditor}
          style={[styles.dialog, RESPONSIVE_DIALOG_STYLE]}>
          <Dialog.Title>{copy.dialogTitle}</Dialog.Title>
          <Dialog.Content>
            <Text variant="titleSmall" style={styles.dialogEmail}>
              {selectedUser?.email}
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
              {copy.choosePermissions}
            </Text>
            {roles.map((role) => {
              const isEnabled = draftRoles.includes(role);
              return (
                <View key={role} style={styles.roleRow}>
                  <Checkbox
                    status={isEnabled ? 'checked' : 'unchecked'}
                    disabled={isSaving}
                    onPress={() =>
                      setDraftRoles((current) =>
                        isEnabled ? current.filter((item) => item !== role) : [...current, role],
                      )
                    }
                    testID={`admin-role-${role}-${selectedUser?.id}`}
                  />
                  <Text style={[styles.roleLabel, { color: colors.onSurface }]}>{copy.roles[role]}</Text>
                </View>
              );
            })}
            {selectedUser?.id === userId ? (
              <Text style={{ color: colors.onSurfaceVariant }}>{copy.selfEditDisabled}</Text>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeEditor} disabled={isSaving} testID="admin-access-cancel">
              {copy.cancel}
            </Button>
            <Button
              mode="contained"
              onPress={() => void saveRoles()}
              disabled={isSaving || changedRoles.length === 0 || selectedUser?.id === userId}
              loading={isSaving}
              testID="admin-access-save">
              {copy.save}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, paddingBottom: 24 },
  dialog: { alignSelf: 'center', maxWidth: 520, width: '100%' },
  dialogEmail: { marginBottom: 12 },
  emptyState: { alignItems: 'flex-start', gap: 4 },
  errorState: { alignItems: 'flex-start', gap: 4 },
  loader: { margin: 12 },
  roleLabel: { flex: 1 },
  roleRow: { alignItems: 'center', flexDirection: 'row', minHeight: 48, paddingLeft: 4 },
  searchInput: { flex: 1 },
  searchRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
});
