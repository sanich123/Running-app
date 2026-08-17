import { useRef } from 'react';
import { View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { saveSport } from '@R/slices/activity-additional-info/activity-additional-info';
import { useAppDispatch } from '@R/typed-hooks';
import ChooseSportModal from '@S/choose-sport-modal/choose-sport-modal';
import { getIconNameByTypeOfSport } from '@U/icon-utils';
import { useActivitySportParams, useSetActivitySportParams } from '../activity-params';
import type { SPORTS_BTNS_VALUES } from '@const/sports';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function IconChooseSport({ disabled = false }: { disabled?: boolean }) {
  const chooseSportModal = useRef<BottomSheetModal>(null);
  const dispatch = useAppDispatch();
  const { sport } = useActivitySportParams();
  const { setSport } = useSetActivitySportParams();

  return (
    <View style={{ position: 'absolute', left: 0 }}>
      <IconButton
        testID="choose-activity-sport"
        icon={getIconNameByTypeOfSport(sport)}
        size={35}
        disabled={disabled}
        onPress={() => chooseSportModal.current?.present()}
        mode="outlined"
      />
      <ChooseSportModal
        chooseSportModalRef={chooseSportModal}
        selectedSport={sport}
        onSportChange={(value) => {
          setSport(value);
          dispatch(saveSport(value as SPORTS_BTNS_VALUES));
        }}
      />
    </View>
  );
}
