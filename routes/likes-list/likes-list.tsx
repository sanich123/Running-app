import { SafeAreaView } from 'react-native-safe-area-context';
import { View, FlatList, useWindowDimensions, Platform, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetLikesByActivityIdQuery } from '@R/services/likes/likes';
import { useAppSelector } from '@R/typed-hooks';
import { EMPTY_STATE_COPY } from '@S/empty-state/const';
import EmptyState from '@S/empty-state/empty-state';
import ErrorComponent from '@S/error-component/error-component';
import useRefresh from '@U/hooks/use-refresh';
import { likeKeyExtractor, renderDivider, renderLikeItem } from './utils';

export default function LikesList() {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { id: activityId } = useLocalSearchParams();
  const {
    isLoading,
    error,
    isError,
    isSuccess,
    data: likes,
    refetch,
  } = useGetLikesByActivityIdQuery(`${activityId}`, { skip: !activityId });
  const { refreshing, onRefresh } = useRefresh(refetch);

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.page, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.content,
          {
            backgroundColor: colors.background,
            width: width < MAX_MOBILE_WIDTH ? '100%' : MAX_MOBILE_WIDTH,
            marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
          },
          (isLoading || isError || !likes?.length) && styles.centered,
        ]}>
        {isLoading ? (
          <ActivityIndicator size="large" testID="likes-list-loading" />
        ) : isSuccess ? (
          likes?.length > 0 ? (
            <FlatList
              testID="likes-list"
              onRefresh={onRefresh}
              refreshing={refreshing}
              data={likes}
              renderItem={renderLikeItem}
              keyExtractor={likeKeyExtractor}
              ItemSeparatorComponent={renderDivider}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={7}
              updateCellsBatchingPeriod={50}
              removeClippedSubviews={Platform.OS === 'android'}
            />
          ) : (
            <EmptyState
              icon="heart-outline"
              title={EMPTY_STATE_COPY[language].likes.title}
              message={EMPTY_STATE_COPY[language].likes.message}
            />
          )
        ) : isError ? (
          <ErrorComponent error={error} refetch={refetch} />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  content: {
    alignSelf: 'stretch',
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
