import ErrorComponent from '@C/error-component/error-component';
import UserListItem from '@C/user-list-item/user-list-item';
import { useGetLikesByActivityIdQuery } from '@R/runich-api/runich-api';
import useRefresh from '@U/hooks/use-refresh';
import { useLocalSearchParams } from 'expo-router';
import { View, SafeAreaView, FlatList, StyleSheet } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';

export default function LikesList() {
  const { id: activityId } = useLocalSearchParams();
  const { isLoading, error, data: likes, refetch } = useGetLikesByActivityIdQuery(`${activityId}`);
  const { refreshing, onRefresh } = useRefresh(refetch);

  return (
    <SafeAreaView style={[{ flex: 1 }, (isLoading || error) && styles.isInCenter]}>
      {likes && (
        <FlatList
          onRefresh={onRefresh}
          refreshing={refreshing}
          data={likes}
          renderItem={({ item }) => <UserListItem userId={item.authorId} />}
          ListEmptyComponent={
            <View>
              <Text variant="headlineLarge">There are no users, who liked your activity</Text>
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

const styles = StyleSheet.create({
  isInCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
