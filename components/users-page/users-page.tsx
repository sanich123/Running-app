import ErrorComponent from '@C/error-component/error-component';
import UserListItem from '@C/user-list-item/user-list-item';
import { useGetFilteredUsersBySearchTextQuery } from '@R/runich-api/runich-api';
import useDebounce from '@U/hooks/use-debounce';
import useRefresh from '@U/hooks/use-refresh';
import { useState } from 'react';
import { View, FlatList } from 'react-native';
import { ActivityIndicator, Divider, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ListOfUsers() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 1000);
  console.log(debouncedSearch);
  const {
    isLoading,
    isError,
    error,
    data: users,
    refetch,
  } = useGetFilteredUsersBySearchTextQuery(debouncedSearch, { skip: !debouncedSearch });
  const { refreshing, onRefresh } = useRefresh(refetch);
  console.log(users?.items);
  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[{ flex: 1 }]}>
      <View>
        <TextInput
          mode="outlined"
          label="Введите имя или email юзера"
          left={<TextInput.Icon icon="text-search" />}
          style={{ marginLeft: 10, marginRight: 10 }}
          onChangeText={(search) => setSearch(search)}
          value={search}
        />

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
          ListEmptyComponent={
            <View style={{ alignItems: 'center' }}>
              <Text variant="headlineLarge">There are no users</Text>
            </View>
          }
          ItemSeparatorComponent={() => <Divider />}
          initialNumToRender={15}
        />
        {isLoading && <ActivityIndicator size="large" />}
        {isError ? <ErrorComponent error={error} /> : null}
      </View>
    </SafeAreaView>
  );
}
