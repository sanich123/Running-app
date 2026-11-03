import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export function createGroupListScrollHandler({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
}) {
  return (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const nearBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height) < 400;
    if (nearBottom && hasNextPage && !isFetchingNextPage) void fetchNextPage();
  };
}
