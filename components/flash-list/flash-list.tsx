import { useAuth } from '@A/context/auth-context';
import EmptyActivitiesList from '@C/empty-activities-list/empty-activities-list';
import ErrorComponent from '@C/error-component/error-component';
import { useGetActivitiesByUserIdWithFriendsActivitiesQuery } from '@R/runich-api/runich-api';
import useCheckPhoneVersion from '@U/hooks/use-check-phone-version';
import usePrefetchSmthng from '@U/hooks/use-prefetch-smthng';
import useRefresh from '@U/hooks/use-refresh';
import { FlashList } from '@shopify/flash-list';
import { useState } from 'react';
import { FlatList } from 'react-native';
import { ActivityIndicator, Divider } from 'react-native-paper';

import { keyExtractor, renderCardsFunction } from './render-item';

export default function OptimizedList() {
  const { isOldVersion } = useCheckPhoneVersion();
  const { user } = useAuth();
  const [page, setPage] = useState(0);

  const {
    data: activities,
    error,
    isLoading,
    refetch,
  } = useGetActivitiesByUserIdWithFriendsActivitiesQuery({ id: `${user?.id}`, page, take: 2 });

  const { onRefresh, refreshing } = useRefresh(refetch);
  usePrefetchSmthng('getUsers');

  return (
    <>
      {isOldVersion ? (
        <FlashList
          onRefresh={onRefresh}
          data={activities}
          refreshing={refreshing}
          renderItem={renderCardsFunction}
          estimatedItemSize={430}
          ListEmptyComponent={<EmptyActivitiesList />}
          ItemSeparatorComponent={() => <Divider />}
        />
      ) : (
        <>
          {activities?.length ? (
            <FlatList
              onRefresh={onRefresh}
              data={activities}
              refreshing={refreshing}
              keyExtractor={keyExtractor}
              renderItem={renderCardsFunction}
              ListEmptyComponent={<EmptyActivitiesList />}
              ItemSeparatorComponent={() => <Divider />}
              initialNumToRender={5}
              maxToRenderPerBatch={10}
              onEndReached={() => {
                setPage(page + 1);
              }}
              ListFooterComponent={() => <ActivityIndicator size="large" />}
            />
          ) : null}
          {isLoading && <ActivityIndicator size="large" testID="homeActivityIndicator" />}
          {error ? <ErrorComponent error={error} /> : null}
        </>
      )}
    </>
  );
}
