import ErrorComponent from '@C/error-component/error-component';
import UserListItemSimple from '@C/user-list-item/user-list-item';
import { useGetLikesByActivityIdQuery } from '@R/runich-api/runich-api';
import useRefresh from '@U/hooks/use-refresh';
import { useLocalSearchParams } from 'expo-router';
import { View, FlatList } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LikesList() {
  const { id: activityId } = useLocalSearchParams();
  const { isLoading, error, isError, data: likes, refetch } = useGetLikesByActivityIdQuery(`${activityId}`);
  const { refreshing, onRefresh } = useRefresh(refetch);

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[{ flex: 1 }, (isLoading || isError || !likes.length) && { justifyContent: 'center' }]}>
      <View>
        {likes?.length > 0 && (
          <FlatList
            onRefresh={onRefresh}
            refreshing={refreshing}
            data={likes}
            renderItem={({ item: { profile } }) => (
              <UserListItemSimple
                name={profile?.name}
                surname={profile?.surname}
                profilePhoto={profile?.profilePhoto}
                placeholder={profile?.profilePhotoBlurhash}
                city={profile?.city}
                user_id={profile?.user_id}
              />
            )}
            ListEmptyComponent={
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineLarge">There are no users, who liked your activity</Text>
              </View>
            }
            ItemSeparatorComponent={() => <Divider />}
          />
        )}
        {isLoading && <ActivityIndicator size="large" />}
        {error ? <ErrorComponent error={error} /> : null}
      </View>
    </SafeAreaView>
  );
}
