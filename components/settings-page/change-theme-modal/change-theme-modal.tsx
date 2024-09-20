import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Fragment, RefObject, useState } from 'react';
import { Appearance, View, ColorSchemeName, StyleSheet } from 'react-native';
import { useTheme, Text, Divider, RadioButton, TouchableRipple } from 'react-native-paper';

export default function ChangeThemeModal({ themesModalRef }: { themesModalRef: RefObject<BottomSheetModal> }) {
  const { colors, dark } = useTheme();
  const [checked, setChecked] = useState('dark');
  return (
    <BottomSheetModal
      ref={themesModalRef}
      index={0}
      snapPoints={['20%']}
      handleStyle={{ borderBottomColor: colors.backdrop }}
      backgroundStyle={{ backgroundColor: colors.backdrop }}
      handleIndicatorStyle={{ backgroundColor: colors.onBackground }}>
      <BottomSheetView style={{ flex: 1, backgroundColor: colors.background }}>
        <View>
          {['dark', 'light'].map((value) => (
            <Fragment key={value}>
              <Divider />
              <TouchableRipple
                rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
                borderless
                style={{
                  ...styles.radioBtn,
                  backgroundColor: colors.backdrop,
                }}
                onPress={() => {
                  setChecked(value);
                  Appearance.setColorScheme(value as ColorSchemeName);
                }}>
                <>
                  <Text variant="titleMedium">{value}</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: '50%',
    padding: 10,
  },
});
