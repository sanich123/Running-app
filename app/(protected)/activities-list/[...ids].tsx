import { FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import { useGetSeveralActivitiesByTheirIdsQuery } from '@R/services/activity/activity';
import ErrorComponent from '@Routes/error-component/error-component';
import { renderCardsFunction } from '@Routes/infinite-scroll-list/render-item';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';

export default function ActivitiesList() {
  const {
    ids: [stringFromIdsArray],
  } = useLocalSearchParams();
  const {
    data: activities,
    isSuccess,
    isError,
    isLoading,
    error,
    refetch,
  } = useGetSeveralActivitiesByTheirIdsQuery({
    ids: stringFromIdsArray,
  });

  return (
    <CrossPlatformLayout edges={[]} isError={isError} isLoading={isLoading} outerStyles={{ padding: 10 }}>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : isSuccess ? (
        <FlatList data={activities} renderItem={renderCardsFunction} initialNumToRender={5} maxToRenderPerBatch={10} />
      ) : isError ? (
        <ErrorComponent error={error} refetch={refetch} />
      ) : null}
    </CrossPlatformLayout>
  );
}
