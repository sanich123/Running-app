import { FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import ErrorComponent from '@C/error-component/error-component';
import { renderCardsFunction } from '@C/infinite-scroll-list/render-item';
import CrossPlatformLayout from '@C/shared/cross-platform-layout/cross-platform-layout';
import { useGetSeveralActivitiesByTheirIdsQuery } from '@R/services/activity/activity';

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
  } = useGetSeveralActivitiesByTheirIdsQuery({
    ids: stringFromIdsArray,
  });

  return (
    <CrossPlatformLayout edges={[]} isError={isError} isLoading={isLoading} outerStyles={{ padding: 10 }}>
      {isLoading && <ActivityIndicator size="large" />}
      {isError && <ErrorComponent error={error} />}
      {isSuccess && (
        <FlatList data={activities} renderItem={renderCardsFunction} initialNumToRender={5} maxToRenderPerBatch={10} />
      )}
    </CrossPlatformLayout>
  );
}
