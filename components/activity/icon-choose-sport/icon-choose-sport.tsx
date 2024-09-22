import { useAppSelector } from '@R/typed-hooks';
import { getIconNameByTypeOfSport } from '@U/icon-utils';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { View } from 'react-native';
import { IconButton } from 'react-native-paper';
import ChooseSportModal from '../choose-sport-modal/choose-sport-modal';

export default function IconChooseSport() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const {
    additionalInfo: { sport },
  } = useAppSelector(({ activity }) => activity);
  return (
    <View style={{ position: 'relative', zIndex: 1 }}>
      <IconButton
        icon={getIconNameByTypeOfSport(sport)}
        size={35}
        style={{ position: 'absolute', left: 0, top: 48 }}
        onPress={() => bottomSheetModalRef.current?.present()}
        mode="outlined"
      />
      <ChooseSportModal bottomSheetModalRef={bottomSheetModalRef} />
    </View>
  );
}
