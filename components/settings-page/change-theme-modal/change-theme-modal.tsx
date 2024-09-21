import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Fragment, RefObject, useState } from 'react';
import { Appearance, View, ColorSchemeName, StyleSheet } from 'react-native';
import { useTheme, Text, Divider, RadioButton, TouchableRipple } from 'react-native-paper';
import { THEMES_ARRAY } from './const';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { changeTheme } from '@R/language/language';

export default function ChangeThemeModal({ themesModalRef }: { themesModalRef: RefObject<BottomSheetModal> }) {
  const { language } = useAppSelector(({ language }) => language);
  const { colors, dark } = useTheme();
  const [checked, setChecked] = useState<string | null>('dark');
  const dispatch = useAppDispatch();

  return (
    <BottomSheetModal
      ref={themesModalRef}
      index={0}
      snapPoints={['30%']}
      handleStyle={{ backgroundColor: colors.onPrimary, borderTopStartRadius: 15, borderTopEndRadius: 15 }}
      backgroundStyle={{ backgroundColor: colors.onPrimary }}
      handleIndicatorStyle={{ backgroundColor: colors.onBackground }}>
      <BottomSheetView style={{ flex: 1, backgroundColor: colors.onSecondary }}>
        <View>
          {THEMES_ARRAY[language].map(({ value, title }) => (
            <Fragment key={value}>
              <Divider />
              <TouchableRipple
                rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
                borderless
                style={styles.radioBtn}
                onPress={() => {
                  setChecked(value);
                  Appearance.setColorScheme(value as ColorSchemeName);
                  dispatch(changeTheme(value));
                }}>
                <>
                  <Text variant="titleMedium">{title}</Text>
                  <RadioButton value={`${value}`} status={checked === value ? 'checked' : 'unchecked'} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: '33%',
    padding: 10,
  },
});
