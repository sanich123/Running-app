import { useEffect } from 'react';
//@ts-expect-error просто нет типов в пакете
import { BatteryOptEnabled } from 'react-native-battery-optimization-check';
import { View, StyleSheet } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import type { BatteryOptimizationSwitcherProps } from '../types';

export default function BatteryOptimizationSwitcher({
  isAppOptimizedByPhone,
  setIsAppOptimizedByPhone,
  batteryOptimizationEnabledModalRef,
  setIsNeedToRefreshPermission,
  isNeedToRefreshPermission,
}: BatteryOptimizationSwitcherProps) {
  useEffect(() => {
    if (isAppOptimizedByPhone || isNeedToRefreshPermission) {
      BatteryOptEnabled()
        .then((isEnabled: boolean) => {
          setIsAppOptimizedByPhone(isEnabled);
          setIsNeedToRefreshPermission(false);
        })
        .catch((error: unknown) => errorToast('Не удалось проверить оптимизацию батареи', error));
    }
  }, [isAppOptimizedByPhone, setIsAppOptimizedByPhone, isNeedToRefreshPermission, setIsNeedToRefreshPermission]);
  const { language } = useAppSelector(({ language }) => language);
  const { colors } = useTheme();

  return (
    <View style={[styles.switcherWrapper, { borderColor: colors.outlineVariant, backgroundColor: colors.surface }]}>
      <Text
        variant="titleSmall"
        style={
          styles.text
        }>{`${language === LANGUAGES.russian ? 'Оптимизация батареи' : 'Battery optimization'}`}</Text>
      <Button
        testID="battery-optimization-details"
        mode="outlined"
        compact
        icon="battery-alert-variant-outline"
        onPress={async () => {
          try {
            batteryOptimizationEnabledModalRef.current?.present();
          } catch (error) {
            errorToast('Не удалось открыть настройки батареи', error);
          }
        }}>
        {language === LANGUAGES.russian ? 'Подробнее' : 'Details'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  switcherWrapper: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    marginTop: 15,
  },
  text: { flex: 1, marginRight: 12 },
});
