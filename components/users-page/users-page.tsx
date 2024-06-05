import ErrorComponent from '@C/error-component/error-component';
import UserListItem from '@C/user-list-item/user-list-item';
import { useGetFilteredUsersBySearchTextQuery } from '@R/runich-api/runich-api';
import useDebounce from '@U/hooks/use-debounce';
import useRefresh from '@U/hooks/use-refresh';
import { useState } from 'react';
import { FlatList } from 'react-native';
import { ActivityIndicator, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyUsersList from './empty-list/empty-list';
import SearchInput from './search-input/search-input';

export default function ListOfUsers() {
  const [isInitial, setIsInitial] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 1000);

  const {
    isLoading,
    isError,
    error,
    data: users,
    refetch,
  } = useGetFilteredUsersBySearchTextQuery(debouncedSearch, { skip: !debouncedSearch });
  const { refreshing, onRefresh } = useRefresh(refetch);

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']}>
      <SearchInput setIsInitial={setIsInitial} setSearch={setSearch} search={search} />
      <FlatList
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
        ListEmptyComponent={<EmptyUsersList isInitial={isInitial} />}
        ItemSeparatorComponent={() => <Divider />}
        initialNumToRender={15}
      />
      {isLoading && <ActivityIndicator size="large" />}
      {isError ? <ErrorComponent error={error} refetch={refetch} /> : null}
    </SafeAreaView>
  );
}
