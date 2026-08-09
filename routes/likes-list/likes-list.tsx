import { SafeAreaView } from 'react-native-safe-area-context';
import { View, FlatList, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Divider, Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetLikesByActivityIdQuery } from '@R/services/likes/likes';
import ErrorComponent from '@Routes/error-component/error-component';
import UserListItem from '@Routes/user-list-item/user-list-item';
import useRefresh from '@U/hooks/use-refresh';

export default function LikesList() {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { id: activityId } = useLocalSearchParams();
  const {
    isLoading,
    error,
    isError,
    isSuccess,
    data: likes,
    refetch,
  } = useGetLikesByActivityIdQuery(`${activityId}`, { skip: !activityId });
  const { refreshing, onRefresh } = useRefresh(refetch);

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.page, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.content,
          {
            backgroundColor: colors.background,
            width: width < MAX_MOBILE_WIDTH ? '100%' : MAX_MOBILE_WIDTH,
            marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
          },
          (isLoading || isError || !likes?.length) && styles.centered,
        ]}>
        {isLoading ? (
          <ActivityIndicator size="large" testID="likes-list-loading" />
        ) : isSuccess ? (
          likes?.length > 0 ? (
            <FlatList
              testID="likes-list"
              onRefresh={onRefresh}
              refreshing={refreshing}
              data={likes}
              renderItem={({ item: { profile } }) => (
                <UserListItem
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
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Text variant="headlineLarge">There are no users, who liked your activity</Text>
            </View>
          )
        ) : isError ? (
          <ErrorComponent error={error} refetch={refetch} />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  content: {
    alignSelf: 'stretch',
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
