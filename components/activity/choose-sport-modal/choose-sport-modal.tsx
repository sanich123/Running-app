import { saveSport } from '@R/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { LANGUAGES } from '@const/enums';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useCallback } from 'react';
import { View } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { ChooseSportModalProps } from '../types';
import { SPORTS_NAMES } from './const';

export default function ChooseSportModal({ chooseSportModalRef }: ChooseSportModalProps) {
  const { language } = useAppSelector(({ language }) => language);
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    [],
  );
  return (
    <BottomSheetModal
      ref={chooseSportModalRef}
      index={0}
      snapPoints={['25%']}
      backdropComponent={renderBackdrop}
      handleStyle={{ backgroundColor: colors.onSecondary, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
      backgroundStyle={{ backgroundColor: colors.onSecondary }}
      handleIndicatorStyle={{ backgroundColor: colors.onBackground }}>
      <BottomSheetView style={{ flex: 1, padding: 10, backgroundColor: colors.onSecondary }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="bodyLarge">
            {language === LANGUAGES.russian ? 'Выберите тип спорта' : 'Choose type of sport'}
          </Text>
          <IconButton icon="close" size={35} onPress={() => chooseSportModalRef.current?.close()} />
        </View>

        <View style={{ flex: 1, flexDirection: 'row' }}>
          {SPORTS_NAMES.map(({ iconName, value }) => (
            <IconButton
              key={iconName}
              icon={iconName}
              size={35}
              onPress={() => {
                dispatch(saveSport(value));
                chooseSportModalRef.current?.close();
              }}
            />
          ))}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
