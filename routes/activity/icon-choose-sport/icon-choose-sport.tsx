import { useRef } from 'react';
import { View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import ChooseSportModal from '@S/choose-sport-modal/choose-sport-modal';
import { getIconNameByTypeOfSport } from '@U/icon-utils';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function IconChooseSport() {
  const chooseSportModal = useRef<BottomSheetModal>(null);
  const { sport } = useAppSelector(({ additionalInfoActivity }) => additionalInfoActivity);

  return (
    <View style={{ position: 'absolute', left: 0 }}>
      <IconButton
        testID="choose-activity-sport"
        icon={getIconNameByTypeOfSport(sport)}
        size={35}
        onPress={() => chooseSportModal.current?.present()}
        mode="outlined"
      />
      <ChooseSportModal chooseSportModalRef={chooseSportModal} />
    </View>
  );
}
