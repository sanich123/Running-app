import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, SafeAreaView, FlatList } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';

import ErrorComponent from '../../../../components/error-component/error-component';
import UserListItem from '../../../../components/user-list-item/user-list-item';
import { useGetLikesByActivityIdQuery } from '../../../../redux/runnich-api/runnich-api';

export default function LikesList() {
  const { id: activityId } = useLocalSearchParams();
  const { isLoading, error, data: likes, refetch } = useGetLikesByActivityIdQuery(activityId.toString());
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch();
    setTimeout(() => setRefreshing(false), 2000);
  }, []);
  return (
    <SafeAreaView style={[{ flex: 1 }, isLoading && { alignItems: 'center', justifyContent: 'center' }]}>
      {likes && (
        <FlatList
          onRefresh={onRefresh}
          refreshing={refreshing}
          data={likes}
          renderItem={({ item }) => <UserListItem userId={item.authorId} />}
          ListEmptyComponent={
            <View>
              <Text variant="headlineLarge">There are no users, who liked your activity, fuck</Text>
            </View>
          }
          ItemSeparatorComponent={() => <Divider />}
        />
      )}
      {isLoading && <ActivityIndicator size="large" />}
      {error ? <ErrorComponent error={error} /> : null}
    </SafeAreaView>
  );
}
