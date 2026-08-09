import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ActivityIndicator, Divider, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetFilteredUsersBySearchTextQuery } from '@R/services/profile/profile';
import ErrorComponent from '@S/error-component/error-component';
import UserListItem from '@S/user-list-item/user-list-item';
import useDebounce from '@U/hooks/use-debounce';
import useRefresh from '@U/hooks/use-refresh';
import EmptyUsersList from './empty-list/empty-list';
import SearchInput from './search-input/search-input';

export default function ListOfUsers() {
  const { colors } = useTheme();
  const [isInitial, setIsInitial] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 1000);
  const { width } = useWindowDimensions();
  const {
    isLoading,
    isError,
    isSuccess,
    error,
    data: users,
    refetch,
  } = useGetFilteredUsersBySearchTextQuery(debouncedSearch, { skip: !debouncedSearch });
  const { refreshing, onRefresh } = useRefresh(refetch);

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      <SearchInput setIsInitial={setIsInitial} setSearch={setSearch} search={search} />
      {isLoading ? (
        <View pointerEvents="none" style={styles.stateOverlay}>
          <ActivityIndicator size="large" testID="users-page-loading" />
        </View>
      ) : isInitial || isSuccess ? (
        <FlatList
          testID="usersList"
          keyboardShouldPersistTaps="handled"
          onRefresh={onRefresh}
          refreshing={refreshing}
          data={users?.items}
          renderItem={({ item }) => (
            <UserListItem
              city={item?.city}
              name={item?.name}
              surname={item?.surname}
              profilePhoto={item?.profilePhoto}
              placeholder={item?.profilePhotoBlurhash}
              user_id={item?.user_id}
            />
          )}
          style={{
            flex: 1,
            width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
            marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
          }}
          ListEmptyComponent={<EmptyUsersList isInitial={isInitial} />}
          ItemSeparatorComponent={() => <Divider />}
          initialNumToRender={15}
        />
      ) : isError ? (
        <View style={styles.stateOverlay}>
          <ErrorComponent error={error} refetch={refetch} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, position: 'relative' },
  stateOverlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
