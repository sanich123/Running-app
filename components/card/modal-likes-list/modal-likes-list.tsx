import { useAppSelector } from '@R/typed-hooks';
import { useGetLikesByActivityIdQuery } from '@R/runich-api/runich-api';
import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import UserListItem from '@C/user-list-item/user-list-item';
import { useCallback } from 'react';

import { Divider, useTheme } from 'react-native-paper';
import { ModalLikesListProps, ProfileType } from '../types';

export default function ModalLikesList({ bottomSheetModalRef, likesLength }: ModalLikesListProps) {
  const { colors } = useTheme();
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
      handleStyle={{ backgroundColor: colors.onSecondary, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
      backgroundStyle={{ backgroundColor: colors.onSecondary }}
      handleIndicatorStyle={{ backgroundColor: colors.onBackground }}>
      <BottomSheetFlatList
        style={{ backgroundColor: colors.onSecondary }}
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
