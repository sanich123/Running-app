import type { RefObject } from 'react';
import { Fragment, useCallback } from 'react';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import type { ColorSchemeName } from 'react-native';
import { Appearance, View, StyleSheet, Platform } from 'react-native';
import { useTheme, Text, Divider, Icon, RadioButton, TouchableRipple } from 'react-native-paper';
import { changeTheme } from '@R/slices/settings/settings';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { THEMES_ARRAY } from './const';

export default function ChangeThemeModal({ themesModalRef }: { themesModalRef: RefObject<BottomSheetModal | null> }) {
  const dispatch = useAppDispatch();
  const { language, theme } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();

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
      handleStyle={{ backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.primary }}>
      <BottomSheetView style={{ flex: 1, backgroundColor: colors.surface }}>
        <View>
          {THEMES_ARRAY[language].map(({ value, title }) => (
            <Fragment key={value}>
              <Divider />
              <TouchableRipple
                borderless
                style={styles.radioBtn}
                onPress={() => {
                  Appearance.setColorScheme((value ?? 'unspecified') as ColorSchemeName);
                  dispatch(changeTheme(value));
                }}>
                <>
                  <Text variant="titleMedium">{title}</Text>
                  {Platform.OS === 'web' ? (
                    <Icon
                      source={theme === value ? 'radiobox-marked' : 'radiobox-blank'}
                      size={24}
                      color={colors.primary}
                    />
                  ) : (
                    <RadioButton value={`${value}`} status={theme === value ? 'checked' : 'unchecked'} />
                  )}
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
