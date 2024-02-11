import { ActivityCardProps } from '@C/card/const ';
import EmptyActivitiesList from '@C/empty-activities-list/empty-activities-list';
import { ToastDuration, showCrossPlatformToast } from '@U/custom-toast';
import useRefresh from '@U/hooks/use-refresh';
import { FlashList } from '@shopify/flash-list';
import { useEffect } from 'react';
import { FlatList, Platform } from 'react-native';
import { Divider } from 'react-native-paper';

import { keyExtractor, renderCardsFunction } from './render-item';

export default function OptimizedList({
  activities,
  refetch,
}: {
  activities: (ActivityCardProps & { user_id: string })[];
  refetch: any;
}) {
  const { onRefresh, refreshing } = useRefresh(refetch);
  const isEarlyAndroid = Platform.OS === 'android' && Platform.Version < 31;
  const isEarylIos = Platform.OS === 'ios' && parseInt(Platform.Version, 10) <= 13;
  const isOldVersion = isEarlyAndroid || isEarylIos;

  useEffect(() => {
    if (isOldVersion) {
      if (Platform.OS !== 'web') {
        showCrossPlatformToast('You have an old version of the phone', ToastDuration.long);
      }
    }
  }, []);

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
        <FlatList
          onRefresh={onRefresh}
          data={activities}
          refreshing={refreshing}
          keyExtractor={keyExtractor}
          renderItem={renderCardsFunction}
          ListEmptyComponent={<EmptyActivitiesList />}
          ItemSeparatorComponent={() => <Divider />}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
        />
      )}
    </>
  );
}
