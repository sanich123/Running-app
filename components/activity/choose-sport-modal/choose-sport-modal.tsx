import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import { saveSport } from '@R/activity/activity';
import { useAppDispatch } from '@R/typed-hooks';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { RefObject } from 'react';
import { View } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';

export default function ChooseSportModal({
  bottomSheetModalRef,
  setVisibilityOfSportIcon,
}: {
  bottomSheetModalRef: RefObject<BottomSheetModal>;
  setVisibilityOfSportIcon: (arg: boolean) => void;
}) {
  const { colors } = useTheme();

  const handleSheetChanges = (index: number) => console.log('handleSheetChanges', index);

  const dispatch = useAppDispatch();
  return (
    <BottomSheetModal ref={bottomSheetModalRef} index={0} snapPoints={['25%']} onChange={handleSheetChanges}>
      <BottomSheetView style={{ flex: 1, padding: 5, backgroundColor: colors.background }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="bodyLarge">Выберите вид спорта</Text>
          <IconButton
            icon="close"
            size={35}
            onPress={() => {
              bottomSheetModalRef.current?.close();
              setVisibilityOfSportIcon(true);
            }}
          />
        </View>

        <View style={{ flex: 1, flexDirection: 'row' }}>
          <IconButton
            icon="run"
            size={35}
            onPress={() => {
              dispatch(saveSport(SPORTS_BTNS_VALUES.run));
              bottomSheetModalRef.current?.close();
              setVisibilityOfSportIcon(true);
            }}
          />
          <IconButton
            icon="bike"
            size={35}
            onPress={() => {
              dispatch(saveSport(SPORTS_BTNS_VALUES.bike));
              bottomSheetModalRef.current?.close();
              setVisibilityOfSportIcon(true);
            }}
          />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
