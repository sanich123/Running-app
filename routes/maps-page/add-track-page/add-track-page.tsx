import { FlatList, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ActivityIndicator, Button, IconButton, Searchbar, Text, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import EmptyState from '@S/empty-state/empty-state';
import ActivityRouteCard from './activity-route-card/activity-route-card';
import DateFilters from './date-filters/date-filters';
import useAddTrackPage from './use-add-track-page';

export default function AddTrackPage() {
  const { colors } = useTheme();
  const {
    activities,
    addActivityTrack,
    availableFilters,
    copy,
    fetchNextPage,
    filters,
    importRoute,
    isError,
    isFetchingNextPage,
    isLoading,
    isSearchOpen,
    language,
    locale,
    refetch,
    searchQuery,
    setIsSearchOpen,
    setSearchQuery,
    updateDateFilter,
    workingActivityId,
    hasMore,
  } = useAddTrackPage();

  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: isSearchOpen ? '' : copy.selectActivity,
          headerTitle: () =>
            isSearchOpen ? (
              <Searchbar
                autoFocus
                iconColor={colors.primary}
                mode="bar"
                placeholder={copy.searchActivities}
                searchAccessibilityLabel={copy.searchActivities}
                accessibilityLabel={copy.searchActivities}
                value={searchQuery}
                onChangeText={setSearchQuery}
                right={() => (
                  <IconButton
                    icon="close"
                    accessibilityLabel={copy.cancel}
                    onPress={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    style={styles.headerSearchClose}
                  />
                )}
                style={styles.headerSearch}
                inputStyle={styles.headerSearchInput}
                testID="search-activities"
              />
            ) : (
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primary,
                  fontFamily: FONT_FAMILIES.semiBold,
                  fontSize: 16,
                  transform: [{ translateY: -2 }],
                }}>
                {copy.selectActivity}
              </Text>
            ),
          headerTitleAlign: 'left',
          headerRight: () => (
            <View style={styles.headerActions}>
              {!isSearchOpen ? (
                <IconButton
                  icon="magnify"
                  accessibilityLabel={copy.searchActivities}
                  onPress={() => setIsSearchOpen(true)}
                  style={styles.headerActionButton}
                  testID="open-workout-search"
                />
              ) : null}
              <IconButton
                icon="plus"
                accessibilityLabel={copy.importRoute}
                onPress={() => void importRoute()}
                style={styles.headerActionButton}
                testID="import-track-file"
              />
            </View>
          ),
        }}
      />
      {isLoading && !activities.length ? (
        <View style={styles.pageState}>
          <ActivityIndicator size="large" testID="route-workouts-loading" />
        </View>
      ) : isError && !activities.length ? (
        <View style={styles.pageState}>
          <Text style={{ color: colors.onSurfaceVariant }}>{copy.routeLoadFailed}</Text>
          <Button mode="outlined" onPress={() => void refetch()}>
            {copy.retry}
          </Button>
        </View>
      ) : (
        <>
          <DateFilters
            filters={filters}
            availableFilters={availableFilters}
            copy={copy}
            locale={locale}
            onChange={updateDateFilter}
          />
          <FlatList
            data={activities}
            testID="route-workout-list"
            keyExtractor={({ id }) => id}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            onEndReached={() => {
              if (hasMore && !isFetchingNextPage) void fetchNextPage();
            }}
            onEndReachedThreshold={0.6}
            ListHeaderComponent={
              isError ? (
                <View style={styles.refreshError}>
                  <Text style={{ color: colors.onSurfaceVariant }}>{copy.routeLoadFailed}</Text>
                  <Button compact onPress={() => void refetch()}>
                    {copy.retry}
                  </Button>
                </View>
              ) : undefined
            }
            ListEmptyComponent={
              <EmptyState
                icon="calendar-search"
                title={copy.noActivities}
                message={copy.noActivitiesMessage}
                style={styles.activityEmptyState}
              />
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator testID="route-workouts-loading-more" style={styles.loadingMore} />
              ) : undefined
            }
            renderItem={({ item }) => (
              <ActivityRouteCard
                activity={item}
                copy={copy}
                language={language}
                isWorking={workingActivityId === item.id}
                isDisabled={Boolean(workingActivityId)}
                onAdd={addActivityTrack}
              />
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, gap: 10, paddingHorizontal: 16, paddingTop: 12 },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  headerActionButton: { height: 40, margin: 0, width: 40 },
  headerSearch: { flex: 1, height: 42, margin: 0, minHeight: 42, width: '100%' },
  headerSearchInput: { fontSize: 14, lineHeight: 18, minHeight: 36, paddingVertical: 0 },
  headerSearchClose: { height: 40, margin: 0, width: 40 },
  pageState: { alignItems: 'center', flex: 1, gap: 16, justifyContent: 'center' },
  refreshError: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  activityEmptyState: { margin: 0, paddingVertical: 24 },
  list: { flexGrow: 1, gap: 10, paddingBottom: 24 },
  loadingMore: { paddingVertical: 12 },
});
