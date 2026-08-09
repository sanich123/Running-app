import { useCallback } from 'react';
import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Divider, useTheme } from 'react-native-paper';
import { useGetLikesByActivityIdQuery } from '@R/services/likes/likes';
import { useAppSelector } from '@R/typed-hooks';
import { EMPTY_STATE_COPY } from '@S/empty-state/const';
import EmptyState from '@S/empty-state/empty-state';
import UserListItem from '@S/user-list-item/user-list-item';
import type { ModalLikesListProps, ProfileType } from '../types';

export default function ModalLikesList({ bottomSheetModalRef, likesLength }: ModalLikesListProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { activityIdWhichLikesToDownload } = useAppSelector(({ mainFeed }) => mainFeed);
  const { language } = useAppSelector(({ language }) => language);
  const { data: likes, isSuccess } = useGetLikesByActivityIdQuery(`${activityIdWhichLikesToDownload}`, {
    skip: !activityIdWhichLikesToDownload,
  });
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
        style={{ backgroundColor: colors.surface }}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }}
        data={likes}
        ListEmptyComponent={
          isSuccess ? (
            <EmptyState
              icon="heart-outline"
              title={EMPTY_STATE_COPY[language].likes.title}
              message={EMPTY_STATE_COPY[language].likes.message}
            />
          ) : null
        }
        renderItem={({ item: { profile } }: { item: { profile: ProfileType } }) => (
          <UserListItem
            name={profile?.name}
            surname={profile?.surname}
            profilePhoto={profile?.profilePhoto}
            placeholder={profile?.profilePhotoBlurhash}
            city={profile?.city}
            user_id={profile?.user_id}
            commentsModalRef={bottomSheetModalRef}
          />
        )}
        ItemSeparatorComponent={() => <Divider />}
      />
    </BottomSheetModal>
  );
}
