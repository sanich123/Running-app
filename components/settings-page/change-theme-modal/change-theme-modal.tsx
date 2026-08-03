import type { RefObject} from 'react';
import { Fragment, useCallback } from 'react';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import type { ColorSchemeName} from 'react-native';
import { Appearance, View, StyleSheet } from 'react-native';
import { useTheme, Text, Divider, RadioButton, TouchableRipple } from 'react-native-paper';
import { changeTheme } from '@R/slices/language/language';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { THEMES_ARRAY } from './const';

export default function ChangeThemeModal({ themesModalRef }: { themesModalRef: RefObject<BottomSheetModal | null> }) {
  const dispatch = useAppDispatch();
  const { language, theme } = useAppSelector(({ language }) => language);
  const { colors, dark } = useTheme();

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    [],
  );

  return (
    <BottomSheetModal
      ref={themesModalRef}
      index={0}
      snapPoints={['30%']}
      backdropComponent={renderBackdrop}
      handleStyle={{ backgroundColor: colors.onSecondary, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
      backgroundStyle={{ backgroundColor: colors.onSecondary }}
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
                  Appearance.setColorScheme(value as ColorSchemeName);
                  dispatch(changeTheme(value));
                }}>
                <>
                  <Text variant="titleMedium">{title}</Text>
                  <RadioButton value={`${value}`} status={theme === value ? 'checked' : 'unchecked'} />
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
