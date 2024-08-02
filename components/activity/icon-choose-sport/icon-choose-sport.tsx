import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import { useAppSelector } from '@R/typed-hooks';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { RefObject } from 'react';
import { IconButton } from 'react-native-paper';

export default function IconChooseSport({
  bottomSheetModalRef,
  setVisibilityOfSportIcon,
  visibilityOfSportIcon,
}: {
  bottomSheetModalRef: RefObject<BottomSheetModal>;
  setVisibilityOfSportIcon: (arg: boolean) => void;
  visibilityOfSportIcon: boolean;
}) {
  const {
    additionalInfo: { sport },
  } = useAppSelector(({ activity }) => activity);
  return (
    <IconButton
      icon={sport === SPORTS_BTNS_VALUES.bike ? 'bike' : 'shoe-sneaker'}
      size={35}
      style={{ position: 'absolute', zIndex: visibilityOfSportIcon ? 10 : 0, left: 0, top: 48 }}
      onPress={() => {
        bottomSheetModalRef.current?.present();
        setVisibilityOfSportIcon(false);
      }}
      mode="outlined"
    />
  );
}
