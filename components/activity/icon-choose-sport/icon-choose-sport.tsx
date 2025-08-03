import { useAppSelector } from '@R/typed-hooks';
import { getIconNameByTypeOfSport } from '@U/icon-utils';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { View } from 'react-native';
import { IconButton } from 'react-native-paper';
import ChooseSportModal from '../choose-sport-modal/choose-sport-modal';

export default function IconChooseSport() {
  const chooseSportModal = useRef<BottomSheetModal>(null);
  const { sport } = useAppSelector(({ additionalInfoActivity }) => additionalInfoActivity);

  return (
    <View style={{ position: 'absolute', left: 0 }}>
      <IconButton
        icon={getIconNameByTypeOfSport(sport)}
        size={35}
        onPress={() => chooseSportModal.current?.present()}
        mode="outlined"
      />
      <ChooseSportModal chooseSportModalRef={chooseSportModal} />
    </View>
  );
}
