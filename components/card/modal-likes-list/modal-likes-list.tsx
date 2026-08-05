import { useCallback } from 'react';
import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Divider, useTheme } from 'react-native-paper';
import UserListItem from '@C/user-list-item/user-list-item';
import { useGetLikesByActivityIdQuery } from '@R/services/likes/likes';
import { useAppSelector } from '@R/typed-hooks';
import type { ModalLikesListProps, ProfileType } from '../types';

export default function ModalLikesList({ bottomSheetModalRef, likesLength }: ModalLikesListProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { activityIdWhichLikesToDownload } = useAppSelector(({ mainFeed }) => mainFeed);
  const { data: likes } = useGetLikesByActivityIdQuery(`${activityIdWhichLikesToDownload}`, {
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
        renderItem={({ item: { profile } }: { item: { profile: ProfileType } }) => (
          <UserListItem
            name={profile?.name}
            surname={profile?.surname}
            profilePhoto={profile?.profilePhoto}
            placeholder={profile?.profilePhotoBlurhash}
            city={profile?.city}
            user_id={profile?.user_id}
          />
        )}
        ItemSeparatorComponent={() => <Divider />}
      />
    </BottomSheetModal>
  );
}
