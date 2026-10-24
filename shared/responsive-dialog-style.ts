import { Platform, type ViewStyle } from 'react-native';

export const RESPONSIVE_DIALOG_STYLE = Platform.select<ViewStyle>({
  web: { alignSelf: 'center', maxWidth: 520, width: '90%' },
  default: {},
});
