import { useAuth } from '@A/context/auth-context';
import ErrorComponent from '@C/error-component/error-component';
import InfiniteScrollList from '@C/infinite-scroll-list/infinite-scroll-list';
import { useGetActivitiesByUserIdQuery } from '@R/runich-api/runich-api';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Activities() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const { data, isLoading, error, refetch } = useGetActivitiesByUserIdQuery(
    { id: `${user?.id}`, page, take: 10 },
    { skip: !user },
  );

  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, justifyContent: 'center' }}>
      {data?.activities?.length && (
        <InfiniteScrollList
          dataToRender={data?.activities}
          page={page}
          setPage={setPage}
          refetch={refetch}
          isLastPage={data?.isLastPage}
        />
      )}
      {isLoading && <ActivityIndicator size="large" testID="userProfilePageActivityIndicator" />}
      {error ? <ErrorComponent error={error} /> : null}
    </SafeAreaView>
  );
}
