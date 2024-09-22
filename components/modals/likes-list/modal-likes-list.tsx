import { useAppSelector } from '@R/typed-hooks';
import { useGetLikesByActivityIdQuery } from '@R/runich-api/runich-api';
import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import UserListItem from '@C/user-list-item/user-list-item';
import { ProfileType } from '@C/card/const ';
import { RefObject } from 'react';

import { Divider, useTheme } from 'react-native-paper';

export default function ModalLikesList({
  bottomSheetModalRef,
  likesLength,
}: {
  bottomSheetModalRef: RefObject<BottomSheetModal>;
  likesLength: number;
}) {
  const { colors } = useTheme();
  const { activityIdWhichLikesToDownload } = useAppSelector(({ mainFeed }) => mainFeed);
  const { data: likes } = useGetLikesByActivityIdQuery(`${activityIdWhichLikesToDownload}`, {
    skip: !activityIdWhichLikesToDownload,
  });

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
      backgroundStyle={{ backgroundColor: colors.secondaryContainer }}
      handleIndicatorStyle={{ backgroundColor: colors.onBackground }}>
      <BottomSheetFlatList
        style={{ backgroundColor: colors.secondaryContainer }}
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
