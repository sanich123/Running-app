import { useLocalSearchParams } from 'expo-router';
import { View, SafeAreaView, FlatList } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';

import ErrorComponent from '../../../../components/error-component/error-component';
import UserListItem from '../../../../components/user-list-item/user-list-item';
import { useGetLikesByActivityIdQuery } from '../../../../redux/runich-api/runich-api';
import useRefresh from '../../../../utils/hooks/use-refresh';

export default function LikesList() {
  const { id: activityId } = useLocalSearchParams();
  const { isLoading, error, data: likes, refetch } = useGetLikesByActivityIdQuery(activityId.toString());
  const { refreshing, onRefresh } = useRefresh(refetch);

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
