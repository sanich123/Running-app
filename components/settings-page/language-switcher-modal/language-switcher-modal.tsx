import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { changeLanguage } from '@R/language/language';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { Fragment, RefObject, useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, RadioButton, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { LANGUAGES_ARRAY } from './const';

export default function LanguageSwitcherModal({
  languagesModalRef,
}: {
  languagesModalRef: RefObject<BottomSheetModal>;
}) {
  const { language } = useAppSelector(({ language }) => language);
  const { colors, dark } = useTheme();
  const [checked, setChecked] = useState(language);
  const dispatch = useAppDispatch();
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    [],
  );
  return (
    <BottomSheetModal
      ref={languagesModalRef}
      index={0}
      snapPoints={['20%']}
      backdropComponent={renderBackdrop}
      handleStyle={{ backgroundColor: colors.onSecondary, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
      backgroundStyle={{ backgroundColor: colors.onSecondary }}
      handleIndicatorStyle={{ backgroundColor: colors.onBackground }}>
      <BottomSheetView style={{ flex: 1, backgroundColor: colors.onSecondary }}>
        <View>
          {LANGUAGES_ARRAY[language].values.map(({ value, title }) => (
            <Fragment key={title}>
              <Divider />
              <TouchableRipple
                rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
                borderless
                style={{ ...styles.radioBtn }}
                onPress={() => {
                  setChecked(value);
                  dispatch(changeLanguage(value));
                }}>
                <>
                  <Text variant="titleMedium">{title}</Text>
                  <RadioButton value={value} status={checked === value ? 'checked' : 'unchecked'} />
                </>
              </TouchableRipple>
            </Fragment>
          ))}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  radioBtn: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '50%',
    padding: 10,
  },
});
