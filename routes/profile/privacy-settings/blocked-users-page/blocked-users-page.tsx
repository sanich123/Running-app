import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ActivityIndicator, Button, List, Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useUnblockUserMutation, useGetBlockedUsersQuery } from '@R/services/moderation/moderation';
import { useAppSelector } from '@R/typed-hooks';
import ErrorComponent from '@S/error-component/error-component';
import { errorToast } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { BLOCKED_USERS_COPY } from './const';

export default function BlockedUsersPage() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = BLOCKED_USERS_COPY[language];
  const { data, isLoading, isError, error, refetch } = useGetBlockedUsersQuery();
  const [unblockUser, { isLoading: isUnblocking }] = useUnblockUserMutation();
  const [unblockingUserId, setUnblockingUserId] = useState<string | null>(null);

  const handleUnblock = async (userId: string) => {
    setUnblockingUserId(userId);
    try {
      await unblockUser(userId).unwrap();
      successToast(copy.unblocked);
    } catch (unblockError) {
      errorToast(copy.error, unblockError);
    } finally {
      setUnblockingUserId(null);
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        {
          width: width < MAX_MOBILE_WIDTH ? '100%' : MAX_MOBILE_WIDTH,
          marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
        },
      ]}>
      {isLoading ? (
        <ActivityIndicator size="large" testID="blocked-users-loading" />
      ) : isError ? (
        <ErrorComponent error={error} refetch={refetch} />
      ) : data?.items.length ? (
        <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          {data.items.map(({ blockedUserId, profile }) => {
            const name = [profile?.name, profile?.surname].filter(Boolean).join(' ') || copy.fallbackName;
            return (
              <List.Item
                key={blockedUserId}
                title={name}
                description={blockedUserId}
                left={(props) => <List.Icon {...props} icon="account-cancel-outline" />}
                right={() => (
                  <Button
                    mode="text"
                    compact
                    disabled={isUnblocking}
                    loading={isUnblocking && unblockingUserId === blockedUserId}
                    onPress={() => void handleUnblock(blockedUserId)}
                    testID={`unblock-user-${blockedUserId}`}>
                    {copy.unblock}
                  </Button>
                )}
              />
            );
          })}
        </View>
      ) : (
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          {copy.empty}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignSelf: 'center', padding: 12 },
  list: { borderColor: 'transparent', borderRadius: 8, borderWidth: 1 },
});
