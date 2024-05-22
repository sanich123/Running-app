import EmptyActivitiesList from '@C/empty-activities-list/empty-activities-list';
import useCheckPhoneVersion from '@U/hooks/use-check-phone-version';
import useRefresh from '@U/hooks/use-refresh';
import { FlashList } from '@shopify/flash-list';
import { FlatList, Platform } from 'react-native';
import { ActivityIndicator, Divider } from 'react-native-paper';

import { keyExtractor, renderCardsFunction } from './render-item';
import { InfiniteScrollListProps } from './type';

export default function InfiniteScrollList({
  dataToRender,
  setPage,
  page,
  refetch,
  isLastPage,
}: InfiniteScrollListProps) {
  const { isOldVersion } = useCheckPhoneVersion();
  const { onRefresh, refreshing } = useRefresh(refetch);

  return (
    <>
      {isOldVersion ? (
        <FlashList
          onRefresh={onRefresh}
          data={dataToRender}
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
          data={dataToRender}
          refreshing={refreshing}
          keyExtractor={keyExtractor}
          renderItem={renderCardsFunction}
          ListEmptyComponent={<EmptyActivitiesList />}
          // ItemSeparatorComponent={() => <Divider />}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          onEndReachedThreshold={Platform.OS === 'web' ? 0.8 : 0.5}
          onEndReached={() => {
            if (!isLastPage) {
              if (Platform.OS === 'web') {
                setTimeout(() => setPage?.(page + 1), 2000);
              } else {
                setPage?.(page + 1);
              }
            }
          }}
          ListFooterComponent={() => !isLastPage && <ActivityIndicator size="large" />}
        />
      )}
    </>
  );
}
