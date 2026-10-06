import { useCallback } from 'react';
import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator, Divider, useTheme } from 'react-native-paper';
import { useGetLikesByActivityIdInfiniteQuery } from '@R/services/likes/likes';
import { useAppSelector } from '@R/typed-hooks';
import { EMPTY_STATE_COPY } from '@S/empty-state/const';
import EmptyState from '@S/empty-state/empty-state';
import UserListItem from '@S/user-list-item/user-list-item';
import type { ModalLikesListProps } from '../types';
import type { LikeListResponse } from '@R/runich-api/types';

export default function ModalLikesList({ bottomSheetModalRef, likesLength, canViewLikes }: ModalLikesListProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { activityIdWhichLikesToDownload } = useAppSelector(({ mainFeed }) => mainFeed);
  const { language } = useAppSelector(({ settings }) => settings);
  const {
    data: likesPages,
    isSuccess,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetLikesByActivityIdInfiniteQuery(
    { activityId: `${activityIdWhichLikesToDownload}` },
    { skip: !canViewLikes || !activityIdWhichLikesToDownload },
  );
  const likes = likesPages?.pages.flatMap(({ likes: pageLikes }) => pageLikes) ?? [];
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    [],
  );
  function getIndexOfSnapPointByLikesLength(length: number) {
    if (length === 1) return 0;
    else if (length === 2) return 1;
    else if (length === 3) return 2;
    else return 3;
  }

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={getIndexOfSnapPointByLikesLength(likesLength)}
      snapPoints={['12%', '20%', '30%', '50%']}
      backdropComponent={renderBackdrop}
      handleStyle={{ backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.primary }}>
      <BottomSheetFlatList
        testID="likes-modal-list"
        style={{ backgroundColor: colors.surface }}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }}
        data={likes}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ padding: 16 }} /> : undefined}
        ListEmptyComponent={
          isSuccess ? (
            <EmptyState
              icon="heart-outline"
              title={EMPTY_STATE_COPY[language].likes.title}
              message={EMPTY_STATE_COPY[language].likes.message}
            />
          ) : undefined
        }
        renderItem={({ item: { profile } }: { item: LikeListResponse }) => (
          <UserListItem
            name={profile?.name}
            surname={profile?.surname}
            profilePhoto={profile?.profilePhoto}
            placeholder={profile?.profilePhotoBlurhash}
            city={profile?.city}
            userId={profile?.userId ?? ''}
            commentsModalRef={bottomSheetModalRef}
          />
        )}
        ItemSeparatorComponent={() => <Divider />}
      />
    </BottomSheetModal>
  );
}
