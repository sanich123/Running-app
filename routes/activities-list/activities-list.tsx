import { FlatList, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import { useGetSeveralActivitiesByTheirIdsQuery } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import { EMPTY_STATE_COPY } from '@S/empty-state/const';
import EmptyState from '@S/empty-state/empty-state';
import ErrorComponent from '@S/error-component/error-component';
import { keyExtractor, renderCardsFunction } from '@S/infinite-scroll-list/render-item';

export default function ActivitiesList() {
  const { language } = useAppSelector(({ language }) => language);
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
        activities?.length ? (
          <FlatList
            data={activities}
            renderItem={renderCardsFunction}
            keyExtractor={keyExtractor}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={7}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews={Platform.OS === 'android'}
          />
        ) : (
          <EmptyState
            icon="calendar-blank-outline"
            title={EMPTY_STATE_COPY[language].activities.title}
            message={EMPTY_STATE_COPY[language].activities.message}
          />
        )
      ) : isError ? (
        <ErrorComponent error={error} refetch={refetch} />
      ) : null}
    </CrossPlatformLayout>
  );
}
