import { useAuth } from '@A/context/auth-context';
import ErrorComponent from '@C/error-component/error-component';
import InfiniteScrollList from '@C/infinite-scroll-list/infinite-scroll-list';
import { useGetActivitiesByUserIdQuery } from '@R/runich-api/runich-api';
import { StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Activities() {
  const { user } = useAuth();
  const { data: userActivities, isError, isLoading, error, refetch } = useGetActivitiesByUserIdQuery(`${user?.id}`);

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[{ flex: 1 }, (isLoading || isError || userActivities?.length === 0) && styles.isInCenter]}>
      {userActivities?.length && (
        <InfiniteScrollList
          dataToRender={userActivities}
          refetch={refetch}
          setPage={undefined}
          page={0}
          isLastPage={false}
        />
      )}
      {isLoading && <ActivityIndicator size="large" testID="userProfilePageActivityIndicator" />}
      {error ? <ErrorComponent error={error} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  isInCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
