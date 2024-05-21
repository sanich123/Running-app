import EmptyActivitiesList from '@C/empty-activities-list/empty-activities-list';
import useCheckPhoneVersion from '@U/hooks/use-check-phone-version';
import useRefresh from '@U/hooks/use-refresh';
import { FlashList } from '@shopify/flash-list';
import { FlatList } from 'react-native';
import { ActivityIndicator, Divider } from 'react-native-paper';

import { keyExtractor, renderCardsFunction } from './render-item';

export default function OptimizedList({
  data,
  setPage,
  page,
  refetch,
}: {
  data: any;
  setPage?: (arg: number) => void;
  page: number;
  refetch: () => void;
}) {
  const { isOldVersion } = useCheckPhoneVersion();
  const { onRefresh, refreshing } = useRefresh(refetch);

  return (
    <>
      {isOldVersion ? (
        <FlashList
          onRefresh={onRefresh}
          data={data}
          refreshing={refreshing}
          renderItem={renderCardsFunction}
          estimatedItemSize={430}
          ListEmptyComponent={<EmptyActivitiesList />}
          ItemSeparatorComponent={() => <Divider />}
          onEndReachedThreshold={0.5}
          onEndReached={() => setPage?.(page + 1)}
          ListFooterComponent={() => <ActivityIndicator size="large" />}
        />
      ) : (
        <FlatList
          onRefresh={onRefresh}
          data={data}
          refreshing={refreshing}
          keyExtractor={keyExtractor}
          renderItem={renderCardsFunction}
          ListEmptyComponent={<EmptyActivitiesList />}
          ItemSeparatorComponent={() => <Divider />}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          onEndReachedThreshold={0.5}
          onEndReached={() => setPage?.(page + 1)}
          ListFooterComponent={() => <ActivityIndicator size="large" />}
        />
      )}
    </>
  );
}
