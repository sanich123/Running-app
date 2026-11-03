import { Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ActivityIndicator, Button, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import EmptyState from '@S/empty-state/empty-state';
import ErrorComponent from '@S/error-component/error-component';
import GroupDetailHeaderActions from './group-detail-header-actions/group-detail-header-actions';
import GroupDetailTabContent from './group-detail-tab-content/group-detail-tab-content';
import GroupInfoCard from './group-info-card/group-info-card';
import useGroupDetailPage from './use-group-detail-page';

export default function GroupDetailPage() {
  const { colors } = useTheme();
  const { copy, error, group, isActiveMember, isError, isLoading, refetch } = useGroupDetailPage();
  const { loadError, retry } = copy;

  return (
    <>
      {isLoading ? (
        <ActivityIndicator style={styles.loader} />
      ) : isError ? (
        <ErrorComponent error={error ?? new Error(loadError)} refetch={refetch} />
      ) : !group ? (
        <View style={styles.errorState}>
          <EmptyState icon="account-group-outline" title={loadError} />
          <Button onPress={() => void refetch()}>{retry}</Button>
        </View>
      ) : (
        <>
          <Stack.Screen
            options={{
              headerRight: () => <GroupDetailHeaderActions group={group} isActiveMember={isActiveMember} />,
            }}
          />
          <View style={[styles.page, Platform.OS === 'web' && styles.webPage, { backgroundColor: colors.background }]}>
            <GroupInfoCard group={group} />
            <GroupDetailTabContent group={group} isActiveMember={isActiveMember} />
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1 },
  errorState: { flex: 1, justifyContent: 'center' },
  page: { flex: 1, gap: 12, paddingHorizontal: 12, paddingTop: 12 },
  webPage: { alignSelf: 'center', maxWidth: MAX_MOBILE_WIDTH, width: '100%' },
});
