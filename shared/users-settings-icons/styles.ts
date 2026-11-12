import { StyleSheet } from 'react-native';
import { SINGLE_ACTION_BUTTON_SIZE } from './const';

export const usersSettingsIconsStyles = StyleSheet.create({
  layout: { display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' },
  singleActionButton: {
    alignItems: 'center',
    borderRadius: SINGLE_ACTION_BUTTON_SIZE / 2,
    borderWidth: StyleSheet.hairlineWidth,
    height: SINGLE_ACTION_BUTTON_SIZE,
    justifyContent: 'center',
    margin: 0,
    padding: 0,
    width: SINGLE_ACTION_BUTTON_SIZE,
  },
});
