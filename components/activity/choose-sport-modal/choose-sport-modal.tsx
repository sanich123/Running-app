import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import { saveSport } from '@R/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { LANGUAGES } from '@const/enums';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { RefObject } from 'react';
import { View } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';

export default function ChooseSportModal({
  bottomSheetModalRef,
}: {
  bottomSheetModalRef: RefObject<BottomSheetModal>;
}) {
  const { language } = useAppSelector(({ language }) => language);
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={['25%']}
      handleStyle={{ borderBottomColor: colors.onBackground }}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.onBackground }}>
      <BottomSheetView style={{ flex: 1, padding: 5, backgroundColor: colors.background }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="bodyLarge">
            {language === LANGUAGES.russian ? 'Выберите тип спорта' : 'Choose type of sport'}
          </Text>
          <IconButton icon="close" size={35} onPress={() => bottomSheetModalRef.current?.close()} />
        </View>

        <View style={{ flex: 1, flexDirection: 'row' }}>
          {[
            { iconName: 'walk', value: SPORTS_BTNS_VALUES.walk },
            { iconName: 'run', value: SPORTS_BTNS_VALUES.run },
            { iconName: 'bike', value: SPORTS_BTNS_VALUES.bike },
            { iconName: 'hiking', value: SPORTS_BTNS_VALUES.hike },
          ].map(({ iconName, value }) => (
            <IconButton
              key={iconName}
              icon={iconName}
              size={35}
              onPress={() => {
                dispatch(saveSport(value));
                bottomSheetModalRef.current?.close();
              }}
            />
          ))}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
