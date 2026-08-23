import { useCallback, useMemo, useRef } from 'react';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useGetCommentsByActivityIdInfiniteQuery } from '@R/services/comments/comments';
import { useAppSelector } from '@R/typed-hooks';
import ErrorComponent from '@S/error-component/error-component';
import { TOP_LOAD_THRESHOLD } from './const';
import Comment from '../comment/comment';
import CommentsEmptyList from '../comments-empty/comments-empty';
import CommentsLoadMoreBtn from '../comments-load-more-btn/comments-load-more';
import CommentsSkeleton from '../comments-skeleton/comments-skeleton';
import type { CommentsProps } from '../types';
import type { CommentResponse } from '@R/runich-api/types';

export default function Comments({ commentsModalRef }: CommentsProps) {
  const { commentActivityId } = useAppSelector(({ comment }) => comment);
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

  if (isInitialLoading) {
    return <CommentsSkeleton />;
  }

  if (isInitialError) {
    return (
      <View style={styles.list}>
        <ErrorComponent error={error} refetch={refetch} />
      </View>
    );
  }

  return (
    <BottomSheetFlatList<CommentResponse>
      data={comments}
      testID="comments-list"
      keyExtractor={(comment) => comment.id}
      renderItem={({ item }) => <Comment {...item} commentsModalRef={commentsModalRef} />}
      contentContainerStyle={styles.content}
      ListHeaderComponent={() => (
        <>
          {shouldShowPaginationAction && (
            <CommentsLoadMoreBtn onPress={loadMoreComments} isLoading={isFetchingNextPage} isError={isError} />
          )}
        </>
      )}
      ListEmptyComponent={<CommentsEmptyList />}
      maintainVisibleContentPosition={{ minIndexForVisible: 1 }}
      keyboardShouldPersistTaps="handled"
      onScrollEndDrag={handleScroll}
      onMomentumScrollEnd={handleScroll}
      style={styles.list}
    />
  );
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
