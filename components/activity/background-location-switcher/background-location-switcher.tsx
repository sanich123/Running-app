import { View, StyleSheet } from 'react-native';

import { showCrossPlatformToast } from '@U/custom-toast';
import { Switch, Text } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { LANGUAGES } from '@const/enums';
import { BackgroundLocationSwitcherProps } from '../types';

export default function BackgroundLocationSwitcher({
  backgroundPermissionStatus,
  backgroundLocationEnabledModalRef,
}: BackgroundLocationSwitcherProps) {
  const { language } = useAppSelector(({ language }) => language);
  return (
    <View style={styles.switcherWrapper}>
      <Text variant="titleSmall">{`${language === LANGUAGES.russian ? 'Включить отслеживание местоположения в фоне' : 'Turn on access to background location'}`}</Text>
      <Switch
        value={backgroundPermissionStatus}
        onValueChange={async () => {
          try {
            backgroundLocationEnabledModalRef.current?.present();
          } catch (error) {
            showCrossPlatformToast(JSON.stringify(error));
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  switcherWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
});
