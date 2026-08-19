import type { RefObject } from 'react';
import { Fragment, useCallback, useState } from 'react';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { View, StyleSheet } from 'react-native';
import { Divider, RadioButton, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { changeLanguage } from '@R/slices/settings/settings';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { LANGUAGES_ARRAY } from './const';

export default function LanguageSwitcherModal({
  languagesModalRef,
}: {
  languagesModalRef: RefObject<BottomSheetModal | null>;
}) {
  const { language } = useAppSelector(({ settings }) => settings);
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
      handleStyle={{ backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.primary }}>
      <BottomSheetView style={{ flex: 1, backgroundColor: colors.surface }}>
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
