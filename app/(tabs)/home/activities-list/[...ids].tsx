import ErrorComponent from '@C/error-component/error-component';
import { renderCardsFunction } from '@C/infinite-scroll-list/render-item';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useGetSeveralActivitiesByTheirIdsQuery } from '@R/runich-api/runich-api';
import { useLocalSearchParams } from 'expo-router';
import { FlatList } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, justifyContent: 'center' }}>
      <BottomSheetModalProvider>
        {isLoading && <ActivityIndicator size="large" />}
        {isError && <ErrorComponent error={error} />}
        {isSuccess && (
          <FlatList
            data={activities}
            renderItem={renderCardsFunction}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
          />
        )}
      </BottomSheetModalProvider>
    </SafeAreaView>
  );
}
