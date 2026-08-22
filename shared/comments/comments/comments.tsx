import { useCallback, useEffect, useMemo, useRef } from 'react';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import {
  FlatList,
  StyleSheet,
  View,
  type FlatListProps,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useGetCommentsByActivityIdInfiniteQuery } from '@R/services/comments/comments';
import { useAppSelector } from '@R/typed-hooks';
import ErrorComponent from '@S/error-component/error-component';
import Comment from '../comment/comment';
import CommentsEmptyList from '../comments-empty/comments-empty';
import CommentsLoadMoreBtn from '../comments-load-more-btn/comments-load-more';
import type { CommentsProps } from '../types';
import type { CommentResponse } from '@R/runich-api/types';

const TOP_LOAD_THRESHOLD = 48;

export default function Comments({
  commentsModalRef,
  onViewStateChange,
  showEmptyState = true,
  isBottomSheet = false,
  headerComponent,
  contentContainerStyle,
}: CommentsProps) {
  const { isShowingTextInput, commentActivityId } = useAppSelector(({ comment }) => comment);
  const { data, error, refetch, isLoading, isError, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useGetCommentsByActivityIdInfiniteQuery({ activityId: commentActivityId }, { skip: !commentActivityId });
  const hasLoadedPage = Boolean(data?.pages.length);
  const hasScrolledFromInitialTop = useRef(false);

  const comments = useMemo(() => {
    const commentsById = new Map<string, CommentResponse>();
    data?.pages.forEach((page) => {
      page.comments.forEach((comment) => commentsById.set(comment.id, comment));
    });

    return [...commentsById.values()].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  }, [data?.pages]);

  const loadMoreComments = useCallback(async () => {
    if (isFetchingNextPage || (!hasNextPage && !(isError && hasLoadedPage))) return;
    hasScrolledFromInitialTop.current = false;
    await fetchNextPage();
  }, [fetchNextPage, hasLoadedPage, hasNextPage, isError, isFetchingNextPage]);

  const handleScroll = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = nativeEvent.contentOffset.y;
      if (offset > TOP_LOAD_THRESHOLD) hasScrolledFromInitialTop.current = true;
      if (offset <= TOP_LOAD_THRESHOLD && hasScrolledFromInitialTop.current) void loadMoreComments();
    },
    [loadMoreComments],
  );

  const isInitialLoading = isLoading && !hasLoadedPage;
  const isInitialError = isError && !hasLoadedPage;
  const shouldShowPaginationAction = Boolean(hasNextPage || (isError && hasLoadedPage));
  const emptyState = showEmptyState && !isShowingTextInput ? <CommentsEmptyList /> : null;

  useEffect(() => {
    if (isInitialLoading) {
      onViewStateChange?.('loading');
    } else if (isInitialError) {
      onViewStateChange?.('error');
    } else {
      onViewStateChange?.(comments.length ? 'loaded' : 'empty');
    }
  }, [comments.length, isInitialError, isInitialLoading, onViewStateChange]);

  if (isInitialLoading) {
    return isBottomSheet ? (
      <View style={styles.list} />
    ) : (
      <ActivityIndicator size="large" testID="commentsActivityIndicator" />
    );
  }

  if (isInitialError) {
    const errorComponent = <ErrorComponent error={error} refetch={refetch} />;
    return isBottomSheet ? <View style={styles.list}>{errorComponent}</View> : errorComponent;
  }

  const listProps: FlatListProps<CommentResponse> = {
    data: comments,
    testID: 'comments-list',
    keyExtractor: (comment) => comment.id,
    renderItem: ({ item }) => <Comment {...item} commentsModalRef={commentsModalRef} />,
    contentContainerStyle: [styles.content, contentContainerStyle],
    ListHeaderComponent: () => (
      <>
        {headerComponent}
        {shouldShowPaginationAction && (
          <CommentsLoadMoreBtn onPress={loadMoreComments} isLoading={isFetchingNextPage} isError={isError} />
        )}
      </>
    ),
    ListEmptyComponent: emptyState,
    maintainVisibleContentPosition: { minIndexForVisible: 1 },
    keyboardShouldPersistTaps: 'handled',
    onScroll: handleScroll,
    scrollEventThrottle: 16,
    style: styles.list,
  };

  return isBottomSheet ? <BottomSheetFlatList {...listProps} /> : <FlatList {...listProps} />;
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
    paddingBottom: 8,
  },
});
